import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "./context/Socket.tsx";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { WebRtcProvider } from "./context/WebRtc.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <SocketProvider>
          <PersistGate loading={null} persistor={persistor}>
            <WebRtcProvider>
              <App />
            </WebRtcProvider>
          </PersistGate>
        </SocketProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
