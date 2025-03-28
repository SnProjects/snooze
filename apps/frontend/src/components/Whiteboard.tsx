import { useEffect, useState, useRef } from 'react';
import { useSync, useSyncDemo } from '@tldraw/sync';
import { AssetRecordType, TLAssetStore, TLBookmarkAsset, Tldraw, uniqueId, getHashForString } from 'tldraw';
import { useAuthStore } from '../stores/auth.store';
import { useChannelStore } from '../stores/channel.store';
import { Box, Alert, Button } from '@chakra-ui/react';
import 'tldraw/tldraw.css';
import { whiteboardHost } from '../services/apiClient';

const WORKER_URL = 'http://localhost:5858' //whiteboardHost;
const CDN_URL = 'http://localhost:3001/cdn';

export function Whiteboard() {
  const { user, accessToken } = useAuthStore();
  const { currentChannel, setCurrentChannel } = useChannelStore();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Reset the channel if it's not a whiteboard channel
  useEffect(() => {
    if (!currentChannel || !accessToken || currentChannel?.type !== 'WHITEBOARD') {
      setCurrentChannel(null);
    }
  }, [currentChannel, accessToken, setCurrentChannel]);

  // Early returns
  if (!currentChannel || currentChannel.type !== 'WHITEBOARD') {
    return <Box>No whiteboard channel selected</Box>;
  }

  if (!user?.id || !user?.username || !accessToken) {
    return <Box>Authentication information is missing</Box>;
  }

  return (
    <WhiteboardEditor
      key={currentChannel.id} // Use channelId as the key to force remount
      channelId={currentChannel.id}
      userId={user.id}
      username={user.username}
      token={accessToken}
      onError={setConnectionError}
    />
  );
}

function WhiteboardEditor({
  channelId,
  userId,
  username,
  token,
  onError,
}: {
  channelId: string;
  userId: string;
  username: string;
  token: string;
  onError: (error: string | null) => void;
}) {
  console.log('Rendering WhiteboardEditor for channel:', channelId);

  // Construct the WebSocket URI
  const uri = `${WORKER_URL}/connect/${channelId}`;
  console.log('WebSocket URI:', uri);

  // Use a ref to track whether the component is mounted
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Use the useSync hook to connect to the whiteboard server
  const store = useSync({
    uri,
    assets: multiplayerAssets,
    userInfo: { id: userId, name: username },
  });
  /* const store = useSyncDemo({
    roomId: channelId,
    userInfo: { id: userId, name: username },
  }); */

  // Track connection status, errors, and timeout
  const [retryCount, setRetryCount] = useState(0);
  const [connectionTimedOut, setConnectionTimedOut] = useState(false);

  useEffect(() => {
    console.log('Whiteboard connection status:', store.status);

    if (store.status === 'error') {
      console.error('Whiteboard connection error:', store.error);
      onError(store.error?.message || 'Failed to connect to whiteboard server');
    } else if (store.status === 'synced-remote') {
      console.log('Whiteboard successfully connected');
      onError(null);
      setConnectionTimedOut(false);
    }

    // Log WebSocket messages for debugging
    const ws = (store as any)._socket as WebSocket | undefined;
    if (ws) {
      const originalOnMessage = ws.onmessage;
      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        if (originalOnMessage) {
          originalOnMessage(event);
        }
      };

      const originalOnError = ws.onerror;
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        if (originalOnError) {
          originalOnError(event);
        }
      };

      const originalOnClose = ws.onclose;
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (originalOnClose) {
          originalOnClose(event);
        }
      };
    }

    // Set a timeout for the connection
    const timeout = setTimeout(() => {
      if (isMountedRef.current && store.status === 'loading') {
        console.error('Whiteboard connection timed out');
        setConnectionTimedOut(true);
        onError('Whiteboard connection timed out. Please try again.');
        // Close the WebSocket connection to prevent further reconnection attempts
        try {
          // @ts-expect-error - Accessing internal WebSocket
          const ws = store._socket;
          if (ws && ws.readyState !== WebSocket.CLOSED) {
            console.log('Closing WebSocket due to timeout');
            ws.close();
          }
        } catch (err) {
          console.error('Error closing WebSocket on timeout:', err);
        }
      }
    }, 20000); // Increased to 20 seconds

    // Cleanup function to close the WebSocket connection
    return () => {
      clearTimeout(timeout);
      console.log('Unmounting WhiteboardEditor, closing WebSocket connection');
      if (store.status === 'synced-remote' || store.status === 'loading') {
        try {
          // @ts-expect-error - Accessing internal WebSocket
          const ws = store._socket;
          if (ws && ws.readyState !== WebSocket.CLOSED) {
            console.log('Closing WebSocket connection');
            ws.close();
          }
        } catch (err) {
          console.error('Error closing WebSocket:', err);
        }
      }
    };
  }, [store, onError, retryCount]);

  const handleRetry = () => {
    console.log('Retrying whiteboard connection');
    setRetryCount((prev) => prev + 1);
    setConnectionTimedOut(false);
    onError(null);
  };

  return (
    <Box h="100vh" w="100%">
      {(store.status === 'error' || connectionTimedOut) && (
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Connection Error</Alert.Title>
            <Alert.Description>
              {connectionTimedOut
                ? 'Whiteboard connection timed out. Please try again.'
                : store.error?.message || 'Failed to connect to whiteboard server'}
              <Button onClick={handleRetry} ml={4}>
                Retry
              </Button>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {store.status === 'loading' && !connectionTimedOut && (
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          Loading whiteboard...
        </Box>
      )}

      <Tldraw
        store={store}
        onMount={(editor) => {
          console.log('Tldraw editor mounted:', editor);
          // @ts-expect-error
          window.editor = editor;
          editor.registerExternalAssetHandler('url', unfurlBookmarkUrl);
        }}
      />
    </Box>
  );
}

// Handle assets (e.g., images, videos)
const multiplayerAssets: TLAssetStore = {
  async upload(_asset, file) {
    const id = uniqueId();
    const objectName = `${id}-${file.name}`;
    const url = `http://localhost:3000/channels/uploads/${encodeURIComponent(objectName)}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`${errorData.error}: ${errorData.details}`);
    }

    return url;
  },
  resolve(asset) {
    // Extract the objectName from the upload URL and serve it via the CDN
    const objectName = asset.props.src.split('/').pop();
    return `${CDN_URL}/${objectName}`;
  },
};

// Handle bookmark unfurling
async function unfurlBookmarkUrl({ url }: { url: string }): Promise<TLBookmarkAsset> {
  const asset: TLBookmarkAsset = {
    id: AssetRecordType.createId(getHashForString(url)),
    typeName: 'asset',
    type: 'bookmark',
    meta: {},
    props: {
      src: url,
      description: '',
      image: '',
      favicon: '',
      title: '',
    },
  };

  try {
    const response = await fetch(`http://localhost:3000/channels/unfurl?url=${encodeURIComponent(url)}`, {
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
      },
    });
    const data = await response.json();

    asset.props.description = data?.description ?? '';
    asset.props.image = data?.image ?? '';
    asset.props.favicon = data?.favicon ?? '';
    asset.props.title = data?.title ?? '';
  } catch (e) {
    console.error(e);
  }

  return asset;
}
