const items = [
  'README에서 프로젝트 소개를 바꾼다.',
  '핵심 happy path를 먼저 구현한다.',
  '실패/빈 상태를 최소 1개 처리한다.',
  '마지막에 pnpm check를 실행한다.',
]

export default function App() {
  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">overtura starter</p>
        <h1>PROJECT_NAME</h1>
        <p className="lead">
          이 화면은 새 프로젝트를 시작할 때 가장 먼저 교체할 placeholder다.
        </p>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
