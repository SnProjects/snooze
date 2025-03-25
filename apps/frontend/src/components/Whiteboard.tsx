import { useEffect, useState } from 'react';
import { useSync } from '@tldraw/sync';
import { AssetRecordType, getHashForString, TLAssetStore, TLBookmarkAsset, Tldraw, uniqueId } from 'tldraw';
import { useAuthStore } from '../stores/auth.store';
import { useChannelStore } from '../stores/channel.store';
import { Box, Button, Alert, AlertTitle, AlertDescription } from '@chakra-ui/react';
import 'tldraw/tldraw.css'
import { whiteboardHost } from '../services/apiClient';

const WORKER_URL = whiteboardHost; // Matches the WebSocket port in WhiteboardsGateway
const CDN_URL = 'http://localhost:3001/cdn'; // CDN URL for serving files

export function Whiteboard() {
  const { user, accessToken } = useAuthStore();
  const { currentChannel, setCurrentChannel } = useChannelStore();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Ensure the current channel is a whiteboard channel
  useEffect(() => {
    if (!currentChannel || !accessToken || currentChannel.type !== 'WHITEBOARD') {
      setCurrentChannel(null);
    }
  }, [currentChannel, accessToken, setCurrentChannel]);

  if (!currentChannel || currentChannel.type !== 'WHITEBOARD') {
    return <Box>No whiteboard channel selected</Box>;
  }

  if (!user?.id || !user?.username) {
    return <Box>User information is missing</Box>;
  }

  if (!accessToken) {
    return <Box>Authentication token is missing</Box>;
  }

  // Create a store connected to multiplayer
  const uri = `${WORKER_URL}?channelId=${currentChannel.id}&token=${accessToken}`;
  console.log('Connecting to WebSocket with URI:', uri);

  const store = useSync({
    uri,
    assets: multiplayerAssets,
    userInfo: {
      id: user.id,
      name: user.username,
    },
  });

  return (
    <Box h="100vh" w="100%">
      {connectionError && (
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Connection Error</Alert.Title>
            <Alert.Description>{connectionError}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <Tldraw
        store={store}
        onMount={(editor) => {
          // @ts-expect-error
          window.editor = editor;
          editor.registerExternalAssetHandler('url', unfurlBookmarkUrl);
          console.log('Tldraw editor mounted:', editor);
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
