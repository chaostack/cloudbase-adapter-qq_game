import { QQRequest, qqMpStorage } from '@cloudbase/adapter-qq_mp';
import { StorageType, WebSocketContructor, SDKAdapterInterface, WebSocketInterface } from '@cloudbase/adapter-interface';

declare const qq;

function isMatch(): boolean {
  if (typeof qq === 'undefined') {
    return false;
  }
  if (!qq.onHide) {
    return false;
  }
  if (!qq.offHide) {
    return false;
  }
  if (!qq.onShow) {
    return false;
  }
  if (!qq.offShow) {
    return false;
  }
  if (!qq.getSystemInfoSync) {
    return false;
  }
  if (!qq.getStorageSync) {
    return false;
  }
  if (!qq.setStorageSync) {
    return false;
  }
  if (!qq.connectSocket) {
    return false;
  }
  if (!qq.request) {
    return false;
  }

  try {
    if (!qq.getSystemInfoSync()) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
}

class QQGameWebSocket {
  constructor(url: string, options: object = {}) {
    const READY_STATE = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    };

    let readyState = READY_STATE.CONNECTING;

    const ws = qq.connectSocket({
      url,
      ...options
    });

    const socketTask: WebSocketInterface = {
      set onopen(cb) {
        ws.onOpen(e => {
          readyState = READY_STATE.OPEN;
          cb && cb(e);
        });
      },
      set onmessage(cb) {
        ws.onMessage(cb);
      },
      set onclose(cb) {
        ws.onClose(e => {
          readyState = READY_STATE.CLOSED;
          cb && cb(e);
        });
      },
      set onerror(cb) {
        ws.onError(cb);
      },
      send: (data) => ws.send({ data }),
      close: (code?: number, reason?: string) => ws.close({ code, reason }),
      get readyState() {
        return readyState;
      },
      CONNECTING: READY_STATE.CONNECTING,
      OPEN: READY_STATE.OPEN,
      CLOSING: READY_STATE.CLOSING,
      CLOSED: READY_STATE.CLOSED
    };
    return socketTask;
  }
}

function genAdapter() {
  // 小程序无sessionStorage
  const adapter: SDKAdapterInterface = {
    root: {},
    reqClass: QQRequest,
    wsClass: QQGameWebSocket as WebSocketContructor,
    localStorage: qqMpStorage,
    primaryStorage: StorageType.local
  };
  return adapter;
}

const adapter = {
  genAdapter,
  isMatch,
  runtime: 'qq_game'
};

export {adapter};
export default adapter;