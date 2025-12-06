export default function Home({ data }) {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>今日夜話</h1>
      <p><strong>生成時間：</strong>{data?.generated_at}</p>
      
      <audio controls autoPlay style={{ width: "100%", margin: "30px 0" }}>
        <source src={data?.audio_url} type="audio/mpeg" />
        你的瀏覽器不支援語音播放
      </audio>
      
      <h2>故事全文</h2>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: "20px" }}>
        {data?.story}
      </pre>
    </div>
  );
}

// SSR 抓最新故事
export async function getServerSideProps() {
  try {
    const res = await fetch("https://" + process.env.VERCEL_URL + "/api/generate");
    const data = await res.json();
    return { props: { data } };
  } catch (e) {
    return { props: { data: null } };
  }
}
