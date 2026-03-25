// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { Suspense } from 'react';
import { CustomizerContextProvider } from './context/CustomizerContext';
import ReactDOM from 'react-dom/client';
import App from './App';
import Spinner from './views/spinner/Spinner';
import './utils/i18n';
import { AuthProvider } from './context/AuthContext';


async function deferRender() {
  const enableMsw = import.meta.env.VITE_ENABLE_MSW === 'true';
  if (import.meta.env.DEV && enableMsw) {
    try {
      const { worker } = await import("./api/mocks/browser");
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      });
      console.log('MSW started successfully');
    } catch (error) {
      console.warn('MSW failed to start:', error);
    }
  }
}

deferRender().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <CustomizerContextProvider>
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <App />
        </Suspense>
      </AuthProvider>
    </CustomizerContextProvider>,
  )
})
