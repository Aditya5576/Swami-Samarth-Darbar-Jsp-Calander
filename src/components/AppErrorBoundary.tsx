import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AppErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('AppErrorBoundary caught error:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-amber-50 flex items-center justify-center p-5 text-center font-['Poppins','Baloo_2',sans-serif]">
          <div className="max-w-md w-full rounded-3xl bg-white border border-orange-200 shadow-lg p-6 space-y-4">
            <img
              src="/pwa-192x192.png"
              alt="श्री स्वामी समर्थ"
              className="w-16 h-16 mx-auto rounded-2xl object-cover ring-2 ring-amber-300 shadow-sm"
            />
            <div className="space-y-1.5">
              <p className="text-xs font-black text-orange-700">॥ श्री स्वामी समर्थ ॥</p>
              <h1 className="text-lg font-black text-orange-950">
                तांत्रिक अडचण आली आहे / Something went wrong
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                कृपया अ‍ॅप पुन्हा सुरू करा. आपली सर्व ऑफलाईन सेवा व सेव्ह केलेल्या नोंदी सुरक्षित आहेत.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>पुन्हा सुरू करा · Reload App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
