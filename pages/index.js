export default function Home({ data }) {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>今日夜話</h1>
      <p><strong>生成時間：</strong>{data?.generated_at}</p>

      <audio 
        preload="metadata"  // 關鍵：預載 metadata，讓 duration 正確
        controls 
        style={{ width: "100%", margin: "30px 0" }}
        onLoadedMetadata={(e) => console.log("Duration loaded:", e.target.duration)}  // 除錯
        onError={(e) => console.log("Audio error:", e.nativeEvent)}  // 除錯
      >
        <source src={data?.audio_url} type="audio/mpeg" />
        瀏覽器不支援
      </audio>

      <h2>故事全文</h2>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: "20px" }}>
        {data?.story}
      </pre>
    </div>
  );
}

export async function getServerSideProps() {
  const res = await fetch(`${process.env.VERCEL_URL}/api/generate`);
  const data = await res.json();
  return { props: { data } };
}
