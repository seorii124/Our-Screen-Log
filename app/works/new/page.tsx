import { Suspense } from "react";
// ... (나머지 폼 임포트)

export default function NewWorkPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      {/* 여기에 폼 컴포넌트나 UI가 들어갑니다 */}
    </Suspense>
  );
}