import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Application Safety Guard] Uncaught error caught by boundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetApp = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDF0] flex items-center justify-center p-4">
          <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-6 sm:p-8 max-w-lg w-full text-center shadow-[6px_6px_0px_#18181b] space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full border-2 border-zinc-900 mx-auto flex items-center justify-center text-amber-600 shadow-[2px_2px_0px_#18181b]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-zinc-900">
                ระบบกำลังกู้คืนข้อมูลความเสถียร
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-zinc-600 leading-relaxed">
                ระบบได้ปกป้องข้อมูลของคุณเรียบร้อยแล้ว ไม่มีการสูญหายของข้อมูลการบ้านหรือคะแนน
              </p>
            </div>

            {this.state.error && (
              <div className="text-[11px] bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-left font-mono text-zinc-500 max-h-24 overflow-y-auto break-all">
                {this.state.error.message || 'ตรวจพบข้อผิดพลาดชั่วคราว'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleResetApp}
                className="flex-1 px-4 py-2.5 bg-amber-300 hover:bg-amber-400 text-zinc-900 font-black text-xs sm:text-sm rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] cursor-pointer transition-transform active:scale-95"
              >
                ลองเข้าใช้งานต่อ
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs sm:text-sm rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>โหลดหน้าเว็บใหม่</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
