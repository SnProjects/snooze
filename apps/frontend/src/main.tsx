import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { App } from './app/app';
import { Provider } from './components/Provider';
import { VoiceProvider } from './context/VoiceContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <VoiceProvider>
          <App />
        </VoiceProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
