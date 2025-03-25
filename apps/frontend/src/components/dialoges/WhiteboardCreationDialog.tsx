import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  Dialog,
  DialogTrigger,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogCloseTrigger,
  CloseButton,
  Portal,
  IconButton,
} from '@chakra-ui/react';

import { FiPlus } from 'react-icons/fi';
import { useWhiteboardStore } from '../../stores/whiteboard.store';
import { useServerStore } from '../../stores';

type TProps = {
  children?: React.ReactNode;
};

const WhiteboardCreationDialog: React.FC = ({ children }: TProps) => {
  const [whiteboardName, setWhiteboardName] = useState('');
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { currentServer } = useServerStore();
  const { createWhiteboard } = useWhiteboardStore();

  const handleDialogClose = () => {
    setWhiteboardName('');
  };

  const handleCreateWhiteboard = () => {
    if (!currentServer) return;
    if (!whiteboardName) return;
    if (whiteboardName.length > 100) return;
    createWhiteboard(whiteboardName, currentServer!.id);
    handleDialogClose();
  };

  return (
    <Dialog.Root
      placement="center"
      motionPreset="slide-in-bottom"
      onOpenChange={(details: any) => {
        if (!details.open) {
          handleDialogClose();
        }
      }}
    >
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <IconButton aria-label="Add Channel" variant="ghost" ml="auto" size="sm">
            <FiPlus />
          </IconButton>
        )}
      </DialogTrigger>
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent ref={contentRef}>
            <DialogHeader>
              <DialogTitle>Create a New Whiteboard</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Box>
                <Input placeholder="Whiteboar Name" value={whiteboardName} onChange={(e) => setWhiteboardName(e.target.value)} mb={4} />
              </Box>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogActionTrigger>
              <Button colorScheme="teal" onClick={handleCreateWhiteboard} ml={3}>
                Create
              </Button>
            </DialogFooter>
            <DialogCloseTrigger asChild>
              <CloseButton size="sm" position="absolute" top={2} right={2} />
            </DialogCloseTrigger>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog.Root>
  );
};

export default WhiteboardCreationDialog;
