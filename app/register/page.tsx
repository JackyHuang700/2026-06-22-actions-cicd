'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

function IconBox({
  children,
  dark = false,
}: {
  children: ReactNode
  dark?: boolean
}) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[22px] font-black leading-none ${dark ? 'bg-blue-500/15 text-[#3D7BFF] ring-1 ring-blue-300/20' : 'bg-blue-50 text-[#3D7BFF]'}`}
    >
      {children}
    </div>
  )
}
IconBox.displayName = 'IconBox' // -----------------------------<< Component >>-----------------------------

function ParticleBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(61,123,255,.18) 1px, transparent 1.4px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div className="absolute -left-48 top-28 h-[360px] w-[760px] rotate-[-12deg] rounded-[50%] bg-[radial-gradient(ellipse,rgba(61,123,255,.10),rgba(255,255,255,0)_65%)] blur-sm animate-[float_9s_ease-in-out_infinite]" />
      <div className="absolute right-[-160px] top-28 h-[420px] w-[680px] rotate-[18deg] rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,255,255,.72),rgba(61,123,255,.08)_45%,rgba(255,255,255,0)_70%)] animate-[float_11s_ease-in-out_infinite_reverse]" />
    </div>
  )
}
ParticleBg.displayName = 'ParticleBg' // -----------------------------<< Component >>-----------------------------

function Register() {
  const rows: ReadonlyArray<readonly [string, string, string]> = [
    ['✉', 'Email Verification', '使用信箱驗證碼確認帳戶擁有權，降低異常註冊風險。'],
    ['◇', 'Account Security', '密碼再次輸入可避免設定錯誤，提升帳戶安全性。'],
    ['▣', 'reCAPTCHA', '加入基礎人機驗證，保護平台免受自動化濫用。'],
  ]

  return (
    <div className="grid w-full max-w-[930px] overflow-hidden rounded-2xl bg-white/90 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative overflow-hidden bg-[#111827] p-10 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(61,123,255,.55) 1px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl font-black">建立帳戶</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            建立 Gridnix 帳戶後，即可進入 Console 管理 VPS、節點與帳單相關資訊。
          </p>
          <div className="mt-7 border-t border-white/10 pt-5">
            {rows.map(([icon, title, desc]) => (
              <div key={title} className="mb-5 flex gap-4">
                <IconBox dark>{icon}</IconBox>
                <div>
                  <b className="text-white">{title}</b>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-sm">
          <h1 className="text-center text-3xl font-black text-[#111827]">
            註冊帳戶
          </h1>
          <p className="mt-3 text-center text-sm text-slate-500">
            完成信箱驗證後即可建立 Gridnix Console 帳戶
          </p>
          <label className="mt-7 block text-sm font-bold">
            信箱
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#3D7BFF]"
              placeholder="name@example.com"
              type="email"
            />
          </label>
          <label className="mt-4 block text-sm font-bold">
            信箱驗證碼
            <div className="mt-2 flex gap-2">
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#3D7BFF]"
                placeholder="輸入驗證碼"
              />
              <button
                type="button"
                className="shrink-0 rounded-lg border border-[#3D7BFF]/30 bg-blue-50 px-4 text-sm font-black text-[#3D7BFF]"
              >
                發送
              </button>
            </div>
          </label>
          <label className="mt-4 block text-sm font-bold">
            密碼
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#3D7BFF]"
              type="password"
              placeholder="至少 8 個字元"
            />
          </label>
          <label className="mt-4 block text-sm font-bold">
            密碼再次輸入
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#3D7BFF]"
              type="password"
              placeholder="再次輸入密碼"
            />
          </label>
          <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <input type="checkbox" className="h-5 w-5" />
                我不是機器人
              </label>
              <div className="text-right text-[10px] font-bold uppercase leading-4 text-slate-400">
                Google
                <br />
                reCAPTCHA
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-[#3D7BFF] py-3 font-black text-white shadow-lg shadow-blue-500/20"
          >
            註冊
          </button>
          <div className="mt-5 text-center text-sm text-slate-500">
            已經有帳號？{' '}
            <Link
              href="/login"
              className="font-black text-[#3D7BFF] hover:underline"
            >
              返回登入
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
Register.displayName = 'Register' // -----------------------------<< Component >>-----------------------------

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center bg-[#F5F5F5]">
      <ParticleBg />
      <Link
        href="/"
        className="absolute left-6 top-6 z-20 rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-500 shadow-sm backdrop-blur hover:text-[#3D7BFF]"
      >
        ← 回首頁
      </Link>
      <main className="relative z-10 flex w-full items-center justify-center px-4 py-10">
        <Register />
      </main>
    </div>
  )
}
RegisterPage.displayName = 'RegisterPage' // -----------------------------<< Component >>-----------------------------
