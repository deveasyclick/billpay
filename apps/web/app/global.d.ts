export {}; // makes this a module

declare global {
  interface Window {
    webpayCheckout?: (options: any) => void;
  }
}
