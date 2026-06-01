import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ActionOS — AI Executive Function Assistant (AI执行功能助手)",
  description: "ActionOS 是一个平静且专注的个人执行系统，基于 Calm Intelligence 哲学与认知行为学模型，通过智能拆解模糊目标，减少规划拖延，提供极易启动的下一步行动建议，全面激活您的执行功能（Executive Function）。",
  keywords: ["ActionOS", "sanage.xyz", "AI执行功能助手", "Executive Function", "拖延症辅助", "时间管理", "任务拆解", "Clarity Design", "Calm Intelligence"],
  authors: [{ name: "sanage.xyz team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

