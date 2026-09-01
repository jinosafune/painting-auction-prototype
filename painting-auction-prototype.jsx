import React, { useState, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// デザイントークン
// ---------------------------------------------------------------------------
const COLORS = {
  paper: "#F5F2ED",
  paperDeep: "#EDE8DE",
  wall: "#1A1815",
  wine: "#6B2635",
  wineDeep: "#4E1B26",
  brass: "#9C7A3C",
  ink: "#1F1B17",
  inkSoft: "#5C564D",
  line: "#D9D2C4",
  white: "#FFFFFF",
};

const FONT_DISPLAY = "'Fraunces', 'Iowan Old Style', Georgia, serif";
const FONT_BODY = "'Work Sans', 'Hiragino Sans', 'Yu Gothic', sans-serif";

// ---------------------------------------------------------------------------
// サンプルデータ(架空の作品)。画像は色面グラデーションで抽象的に表現。
// ---------------------------------------------------------------------------
const PAINTINGS = [
  {
    id: 1,
    title: "遠い夏の記憶",
    artist: "青柳 誠",
    year: 2019,
    size: "F30(910×727mm)",
    technique: "油彩・キャンバス",
    start: 180000,
    palette: ["#3B5B6E", "#89A6A0", "#E7CBA9"],
    desc: "海辺の光を重ねた油彩画。作家の代表的なブルーの層が特徴。",
  },
  {
    id: 2,
    title: "赤の断章 III",
    artist: "堂本 玲",
    year: 2021,
    size: "F20(727×606mm)",
    technique: "アクリル・キャンバス",
    start: 95000,
    palette: ["#6B2635", "#C1543C", "#2A1E1B"],
    desc: "抽象表現の連作より。赤の濃淡だけで構成された一点。",
  },
  {
    id: 3,
    title: "静物、午後三時",
    artist: "宇田川 螢",
    year: 2016,
    size: "F8(455×380mm)",
    technique: "油彩・板",
    start: 62000,
    palette: ["#9C7A3C", "#E7DCC3", "#4A3B26"],
    desc: "光の差し込む窓辺を描いた小品。落ち着いた金褐色の階調。",
  },
  {
    id: 4,
    title: "無題(層)",
    artist: "青柳 誠",
    year: 2023,
    size: "F50(1167×910mm)",
    technique: "混合技法・キャンバス",
    start: 320000,
    palette: ["#1A1815", "#3B5B6E", "#9C7A3C"],
    desc: "大型作品。マチエールを重ねた作家の近作。",
  },
];

const fmt = (n) => `¥${n.toLocaleString("ja-JP")}`;

// ---------------------------------------------------------------------------
// 抽象「絵画」プレースホルダー
// ---------------------------------------------------------------------------
function ArtworkImage({ palette, id, tall }) {
  const gid = `g${id}`;
  return (
    <svg
      viewBox="0 0 400 320"
      style={{ width: "100%", height: tall ? 260 : 150, display: "block", borderRadius: 2 }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="55%" stopColor={palette[1]} />
          <stop offset="100%" stopColor={palette[2]} />
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill={gid ? `url(#${gid})` : palette[0]} />
      <rect width="400" height="320" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// カウントダウン用フック
// ---------------------------------------------------------------------------
function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return { seconds, label: `${h}:${m}:${s}`, setSeconds };
}

// ---------------------------------------------------------------------------
// トップバー / タブバー
// ---------------------------------------------------------------------------
function TopBar({ title, onBack }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "16px 18px 14px",
        borderBottom: `1px solid ${COLORS.line}`,
        background: COLORS.paper,
      }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "none",
            fontSize: 20,
            color: COLORS.ink,
            cursor: "pointer",
            padding: 0,
            lineHeight: 1,
          }}
          aria-label="戻る"
        >
          ←
        </button>
      ) : (
        <div style={{ width: 20 }} />
      )}
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 18,
          letterSpacing: "0.02em",
          color: COLORS.ink,
        }}
      >
        {title}
      </div>
    </div>
  );
}

function TabBar({ tab, setTab }) {
  const items = [
    { key: "home", label: "出品作品" },
    { key: "submit", label: "出品する" },
    { key: "mypage", label: "マイページ" },
  ];
  return (
    <div
      style={{
        display: "flex",
        borderTop: `1px solid ${COLORS.line}`,
        background: COLORS.white,
      }}
    >
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => setTab(it.key)}
          style={{
            flex: 1,
            border: "none",
            background: "none",
            padding: "12px 4px 14px",
            cursor: "pointer",
            fontFamily: FONT_BODY,
            fontSize: 12,
            letterSpacing: "0.02em",
            color: tab === it.key ? COLORS.wine : COLORS.inkSoft,
            fontWeight: tab === it.key ? 600 : 400,
            borderTop: tab === it.key ? `2px solid ${COLORS.wine}` : "2px solid transparent",
            marginTop: -1,
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ホーム(出品作品一覧)
// ---------------------------------------------------------------------------
function HomeScreen({ onOpen, bids }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.paper }}>
      <div style={{ padding: "18px 18px 8px" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: COLORS.ink, lineHeight: 1.15 }}>
          開催中のオークション
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.inkSoft, marginTop: 6 }}>
          すべての出品作品は鑑定業者による事前鑑定を通過しています
        </div>
      </div>
      <div style={{ padding: "10px 14px 90px", display: "flex", flexDirection: "column", gap: 14 }}>
        {PAINTINGS.map((p) => {
          const current = bids[p.id]?.current ?? p.start;
          return (
            <button
              key={p.id}
              onClick={() => onOpen(p.id)}
              style={{
                textAlign: "left",
                border: `1px solid ${COLORS.line}`,
                background: COLORS.white,
                borderRadius: 3,
                padding: 0,
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                gap: 0,
              }}
            >
              <div style={{ width: 118, flexShrink: 0 }}>
                <ArtworkImage palette={p.palette} id={p.id} />
              </div>
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15.5, color: COLORS.ink }}>{p.title}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.inkSoft }}>{p.artist} / {p.year}</div>
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: COLORS.inkSoft }}>現在価格</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: COLORS.wine }}>{fmt(current)}</div>
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: 10.5,
                      color: COLORS.brass,
                      border: `1px solid ${COLORS.brass}`,
                      borderRadius: 20,
                      padding: "2px 8px",
                    }}
                  >
                    鑑定済
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 作品詳細 / 入札画面
// ---------------------------------------------------------------------------
function DetailScreen({ painting, bidState, setBidState, onBack }) {
  const { label, seconds } = useCountdown(bidState.secondsLeft);
  const [flash, setFlash] = useState(false);
  const rivalTimer = useRef(null);

  // 他の入札者によるライブ入札のシミュレーション
  useEffect(() => {
    rivalTimer.current = setInterval(() => {
      setBidState((prev) => {
        if (Math.random() > 0.62 && prev.secondsLeft > 5) {
          const step = Math.round((prev.current * 0.02 + 1500) / 500) * 500;
          const next = prev.current + step;
          setFlash(true);
          setTimeout(() => setFlash(false), 500);
          return {
            ...prev,
            current: next,
            history: [{ who: "他の入札者", amount: next, t: Date.now() }, ...prev.history].slice(0, 8),
          };
        }
        return prev;
      });
    }, 4500);
    return () => clearInterval(rivalTimer.current);
  }, [setBidState]);

  const step = Math.round((bidState.current * 0.05) / 500) * 500 || 1000;

  const placeBid = () => {
    setBidState((prev) => {
      const next = prev.current + step;
      return {
        ...prev,
        current: next,
        history: [{ who: "あなた", amount: next, t: Date.now() }, ...prev.history].slice(0, 8),
      };
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 500);
  };

  const p = painting;
  const ended = seconds === 0;

  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.paper }}>
      <TopBar title={p.title} onBack={onBack} />
      <ArtworkImage palette={p.palette} id={p.id} tall />
      <div style={{ padding: "16px 18px 100px" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: COLORS.ink }}>{p.title}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>
          {p.artist} / {p.year}年 / {p.technique}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>
          サイズ: {p.size}
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "16px 16px",
            background: flash ? "#F1E7DA" : COLORS.white,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 3,
            transition: "background 0.4s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLORS.inkSoft }}>現在の最高額</div>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: 12,
                color: ended ? COLORS.inkSoft : COLORS.wine,
                fontWeight: 600,
              }}
            >
              {ended ? "終了しました" : `残り ${label}`}
            </div>
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLORS.ink, marginTop: 2 }}>
            {fmt(bidState.current)}
          </div>

          <button
            onClick={placeBid}
            disabled={ended}
            style={{
              width: "100%",
              marginTop: 14,
              padding: "13px 0",
              background: ended ? COLORS.line : COLORS.wine,
              color: ended ? COLORS.inkSoft : COLORS.white,
              border: "none",
              borderRadius: 3,
              fontFamily: FONT_BODY,
              fontSize: 14.5,
              fontWeight: 600,
              cursor: ended ? "default" : "pointer",
              letterSpacing: "0.01em",
            }}
          >
            {ended ? "オークション終了" : `${fmt(bidState.current + step)} で入札する`}
          </button>
          <div style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: COLORS.inkSoft, marginTop: 8, textAlign: "center" }}>
            入札は取り消せません。落札後はエスクロー決済に進みます。
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: COLORS.ink, marginBottom: 8 }}>作品について</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.7 }}>{p.desc}</div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: COLORS.ink, marginBottom: 8 }}>入札履歴</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {bidState.history.length === 0 && (
              <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.inkSoft }}>まだ入札はありません</div>
            )}
            {bidState.history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: `1px solid ${COLORS.line}`,
                  fontFamily: FONT_BODY,
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: h.who === "あなた" ? COLORS.wine : COLORS.inkSoft }}>{h.who}</span>
                <span style={{ color: COLORS.ink, fontWeight: 500 }}>{fmt(h.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 出品フォーム(鑑定申請)
// ---------------------------------------------------------------------------
function SubmitScreen() {
  const [step, setStep] = useState(0); // 0: フォーム, 1: 送信済み
  const [form, setForm] = useState({ title: "", artist: "", size: "", technique: "", year: "", start: "" });

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const field = (label, key, placeholder, type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: COLORS.inkSoft, display: "block", marginBottom: 5 }}>
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={update(key)}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: `1px solid ${COLORS.line}`,
          borderRadius: 3,
          padding: "10px 12px",
          fontFamily: FONT_BODY,
          fontSize: 13.5,
          color: COLORS.ink,
          background: COLORS.white,
        }}
      />
    </div>
  );

  if (step === 1) {
    return (
      <div style={{ flex: 1, background: COLORS.paper, display: "flex", flexDirection: "column" }}>
        <TopBar title="出品する" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", textAlign: "center" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: COLORS.ink, marginBottom: 10 }}>
            鑑定申請を受け付けました
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.7 }}>
            提携鑑定業者による真贋・状態の確認後、通常3〜5営業日で結果をお知らせします。承認された作品のみ出品ページに掲載されます。
          </div>
          <button
            onClick={() => { setStep(0); setForm({ title: "", artist: "", size: "", technique: "", year: "", start: "" }); }}
            style={{
              marginTop: 22,
              padding: "10px 20px",
              background: "none",
              border: `1px solid ${COLORS.wine}`,
              color: COLORS.wine,
              borderRadius: 3,
              fontFamily: FONT_BODY,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            もう一点、出品する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.paper }}>
      <TopBar title="出品する" />
      <div style={{ padding: "18px 18px 100px" }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.6 }}>
          作品情報を入力してください。出品には提携鑑定業者による事前鑑定の承認が必要です。
        </div>

        <div
          style={{
            border: `1px dashed ${COLORS.brass}`,
            borderRadius: 3,
            padding: "26px 10px",
            textAlign: "center",
            marginBottom: 18,
            background: COLORS.white,
          }}
        >
          <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.brass }}>
            + 作品画像をアップロード(複数可)
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: COLORS.inkSoft, marginTop: 4 }}>
            全体・サイン・状態が分かる画像を推奨
          </div>
        </div>

        {field("作品タイトル", "title", "例:遠い夏の記憶")}
        {field("作家名", "artist", "例:青柳 誠")}
        {field("制作年", "year", "例:2024", "number")}
        {field("サイズ", "size", "例:F20(727×606mm)")}
        {field("技法", "technique", "例:油彩・キャンバス")}
        {field("開始価格(円)", "start", "例:100000", "number")}

        <button
          onClick={() => setStep(1)}
          disabled={!form.title || !form.artist}
          style={{
            width: "100%",
            marginTop: 6,
            padding: "13px 0",
            background: form.title && form.artist ? COLORS.wine : COLORS.line,
            color: form.title && form.artist ? COLORS.white : COLORS.inkSoft,
            border: "none",
            borderRadius: 3,
            fontFamily: FONT_BODY,
            fontSize: 14,
            fontWeight: 600,
            cursor: form.title && form.artist ? "pointer" : "default",
          }}
        >
          鑑定を申請する
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// マイページ
// ---------------------------------------------------------------------------
function MyPageScreen({ bids }) {
  const rows = [
    { label: "本人確認(KYC)", value: "確認済み", ok: true },
    { label: "支払い方法", value: "クレジットカード登録済み", ok: true },
    { label: "配送先住所", value: "未登録", ok: false },
  ];
  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.paper }}>
      <TopBar title="マイページ" />
      <div style={{ padding: "18px 18px 100px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px",
            background: COLORS.wall,
            borderRadius: 3,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: COLORS.brass,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_DISPLAY,
              color: COLORS.wall,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            匿
          </div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: COLORS.white }}>ゲスト会員</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: "#C9C2B4" }}>入札者ランク: ブロンズ</div>
          </div>
        </div>

        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: COLORS.ink, marginBottom: 8 }}>アカウント状況</div>
        <div style={{ marginBottom: 22 }}>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: `1px solid ${COLORS.line}`,
                fontFamily: FONT_BODY,
                fontSize: 13,
              }}
            >
              <span style={{ color: COLORS.inkSoft }}>{r.label}</span>
              <span style={{ color: r.ok ? COLORS.brass : COLORS.wine, fontWeight: 500 }}>{r.value}</span>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: COLORS.ink, marginBottom: 8 }}>参加中のオークション</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PAINTINGS.filter((p) => bids[p.id]?.history?.some((h) => h.who === "あなた")).map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                border: `1px solid ${COLORS.line}`,
                borderRadius: 3,
                background: COLORS.white,
              }}
            >
              <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.ink }}>{p.title}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.wine, fontWeight: 600 }}>
                {fmt(bids[p.id].current)}
              </div>
            </div>
          ))}
          {!PAINTINGS.some((p) => bids[p.id]?.history?.some((h) => h.who === "あなた")) && (
            <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.inkSoft }}>
              まだ入札した作品はありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ルート
// ---------------------------------------------------------------------------
export default function App() {
  const [tab, setTab] = useState("home");
  const [openId, setOpenId] = useState(null);

  const [bids, setBids] = useState(() => {
    const init = {};
    PAINTINGS.forEach((p, i) => {
      init[p.id] = {
        current: p.start + (i === 1 ? 8000 : 0),
        secondsLeft: 3600 * (2 + i) + 90,
        history: [],
      };
    });
    return init;
  });

  const setBidStateFor = (id) => (updater) =>
    setBids((prev) => ({ ...prev, [id]: typeof updater === "function" ? updater(prev[id]) : updater }));

  const openPainting = PAINTINGS.find((p) => p.id === openId);

  let content;
  if (openPainting) {
    content = (
      <DetailScreen
        painting={openPainting}
        bidState={bids[openPainting.id]}
        setBidState={setBidStateFor(openPainting.id)}
        onBack={() => setOpenId(null)}
      />
    );
  } else if (tab === "home") {
    content = <HomeScreen onOpen={setOpenId} bids={bids} />;
  } else if (tab === "submit") {
    content = <SubmitScreen />;
  } else {
    content = <MyPageScreen bids={bids} />;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: COLORS.wall,
        padding: "24px 0",
        fontFamily: FONT_BODY,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input:focus { outline: 2px solid ${COLORS.brass}; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid ${COLORS.brass}; outline-offset: 1px; }
      `}</style>
      <div
        style={{
          width: 390,
          maxWidth: "100%",
          height: 780,
          maxHeight: "92vh",
          background: COLORS.paper,
          borderRadius: 34,
          border: `8px solid ${COLORS.wall}`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {!openPainting && (
          <div
            style={{
              padding: "10px 18px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: COLORS.paper,
            }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, letterSpacing: "0.04em", color: COLORS.ink }}>
              CANVAS AUCTION
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: COLORS.inkSoft }}>プロトタイプ</div>
          </div>
        )}
        {content}
        {!openPainting && <TabBar tab={tab} setTab={setTab} />}
      </div>
    </div>
  );
}
