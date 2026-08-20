import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReveal, useCountUp } from '../hooks/useReveal'
import { HeroVisual } from '../components/HeroVisual'

/**
 * Cinematic Lite Mode — the byte-for-byte v4 black-silver page. This renders
 * whenever WebGL is unavailable, the device is weak, the user prefers reduced
 * motion, or the 3D world fails to load. All copy, CTAs, the QR <img> and the
 * non-guarantee disclaimer are identical to (and shared with) the immersive
 * overlay, so signup can never break or diverge.
 */

const QR_SRC = `${import.meta.env.BASE_URL}qr-host-wechat.jpg`
const IMG = (n: string) => `${import.meta.env.BASE_URL}img/${n}`

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`reveal${shown ? ' in' : ''}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

function CountBig({ to, suffix }: { to: number; suffix: string }) {
  const { ref, value } = useCountUp(to)
  return (
    <span className="big">
      <span ref={ref}>{value}</span>
      {suffix}
    </span>
  )
}

function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="#dfe5ea" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M32 12 L50 22 L50 42 L32 52 L14 42 L14 22 Z" />
        <path d="M32 12 L32 32 M32 32 L50 22 M32 32 L14 22 M32 32 L32 52" />
      </g>
    </svg>
  )
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LiteApp({ onEnter3D }: { onEnter3D?: () => void }) {
  const [ctaHidden, setCtaHidden] = useState(false)
  const joinRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = joinRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((e) => setCtaHidden(e[0].isIntersecting), { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="app">
      {onEnter3D && (
        <button className="enter3d-toggle" onClick={onEnter3D} aria-label="进入沉浸式 3D 世界">
          <span className="e3-dot" /> 进入沉浸 3D 世界
        </button>
      )}
      {/* ============ 1 · HERO ============ */}
      <header className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="grid" />
          <div className="halo" />
          <div className="scan" />
          <div className="noise" />
        </div>
        <HeroVisual />
        <div className="wrap">
          <div className="hero-kicker">
            <span className="dot" /> UW–MADISON &nbsp;×&nbsp; TRIPO
          </div>
          <h1 className="hero-title">
            从一句话，
            <span className="l2">
              到一个<span className="metal">三维世界</span>
            </span>
          </h1>
          <div className="hero-sub">TRIPO AI 3D 社团 · 2026 秋季招新</div>
          <p className="hero-body">
            当大多数人还在用 AI 生成图片，我们已经开始生成角色、资产、空间和真正可以运行的三维世界。
          </p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => scrollToId('join')}>
              加入 2026 秋季招新
            </button>
            <button className="btn-text" onClick={() => scrollToId('what')}>
              看看我们要做什么 <span className="arw">→</span>
            </button>
          </div>
        </div>
        <div className="scroll-hint" aria-hidden="true">
          <span className="bar" /> 向下滑动 · 开始生成
        </div>
      </header>

      <main>
        {/* ============ 2 · COMPANY — smoke / bento ============ */}
        <section className="section s-smoke" id="about">
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">COMPANY</span>
              <h2 className="h-title">认识 TRIPO：让每个人都能创造三维世界</h2>
              <p className="lead">
                TRIPO 是由 VAST 打造的 AI 原生三维创作平台。通过文字或图片，创作者可以快速生成可继续编辑和使用的
                3D 模型，并将资产接入 Blender、Unity、Unreal、Godot 等创作和开发流程。
              </p>
              <p className="lead">
                从游戏角色、虚拟空间和产品原型，到 XR、动画、工业设计与 3D 打印，AI 正在重新定义三维内容的生产方式。
              </p>
              <p className="pull">过去需要专业团队数天完成的原型，现在可以从一句 <span className="ice">Prompt</span> 开始。</p>
            </Reveal>
            <Reveal delay={80}>
              <div className="bento">
                <div className="cell">
                  <div className="sheen" />
                  <div className="k">Creators</div>
                  <CountBig to={20} suffix="M+" />
                  <div className="cap">全球创作者</div>
                </div>
                <div className="cell">
                  <div className="sheen" />
                  <div className="k">3D Models</div>
                  <CountBig to={200} suffix="M+" />
                  <div className="cap">AI 生成 3D 模型</div>
                </div>
                <div className="cell wide cap-list">
                  <div className="k">Capabilities</div>
                  <div className="row">Text to 3D · Image to 3D</div>
                  <div className="row">接入 Blender / Unity / Unreal / Godot</div>
                  <div className="row">游戏 · XR · 动画 · 工业设计 · 3D 打印</div>
                </div>
                <div className="cell wide">
                  <div className="k">Partnership</div>
                  <div className="cap" style={{ marginTop: 6, color: 'var(--fg)', fontSize: 16, fontWeight: 600 }}>
                    Sony × VAST — 官方 3D 业务合作
                  </div>
                </div>
              </div>
              <p className="note-mono" style={{ marginTop: 12 }}>
                数据来源：tripo3d.ai 官方页面（20M+ 创作者 · 已生成 200M 3D 模型）
              </p>
            </Reveal>
            <Reveal delay={100}>
              <figure className="fig wire">
                <div className="fig-head">
                  <span>Generated Assets</span>
                  <span className="hi">TEXT · IMAGE → 3D</span>
                </div>
                <img
                  src={IMG('gallery.webp')}
                  width={1600}
                  height={1600}
                  loading="lazy"
                  decoding="async"
                  alt="高精度 PBR 3D 资产渲染：一顶带完整贴图、法线与反光的科幻头盔模型"
                />
                <figcaption className="cap">带完整 PBR 贴图的 3D 资产 · 公开授权模型实时渲染</figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* ============ 3 · WHY NOW — ivory ============ */}
        <section className="section s-ivory" id="why">
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">WHY NOW</span>
              <h2 className="h-title">AI 改变了图片，下一步就是整个三维世界</h2>
              <p className="lead">
                游戏里的角色、VR 中的空间、电影里的资产、数字人、产品原型和虚拟世界，都离不开 3D 内容。
              </p>
              <p className="lead">
                过去，三维创作的门槛是建模经验、时间和成本。现在，AI 正在重新定义从创意到资产、从资产到交互体验的完整流程。
              </p>
            </Reveal>
            <Reveal delay={60}>
              <div className="statement">
                <div className="sheen" />
                <p>
                  当别人还停留在 Prompt 出图，你已经可以把 Prompt 变成一个<span className="ice">可交互世界</span>。
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ 4 · CLUB — smoke / duo ============ */}
        <section className="section s-smoke" id="what">
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">THE CLUB</span>
              <h2 className="h-title">不是“每月听一次讲座”，而是一支真正做项目的团队</h2>
            </Reveal>
            <Reveal delay={60}>
              <div className="duo">
                <div className="mod open">
                  <div className="lab">OPEN · 面向所有人</div>
                  <h3>开放社区</h3>
                  <ul className="list">
                    <li>每月工作坊</li>
                    <li>TRIPO 实操体验</li>
                    <li>官方课程和挑战</li>
                    <li>创意分享</li>
                    <li>比赛与展示</li>
                    <li>零基础入门</li>
                  </ul>
                </div>
                <div className="mod core">
                  <div className="lab">CORE · 进阶需投入</div>
                  <h3>核心项目组</h3>
                  <ul className="list">
                    <li>自主提出项目创意</li>
                    <li>组建技术与创意团队</li>
                    <li>制定 MVP 和开发周期</li>
                    <li>使用 GitHub 或项目管理工具协作</li>
                    <li>定期 Sprint 和 Demo Review</li>
                    <li>完成可以公开演示的作品</li>
                  </ul>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <p className="pull">我们不要求每个人已经很厉害，但希望你愿意真的把东西做出来。</p>
              <div className="note-block">
                该社团由 TRIPO 校园联系人发起。项目方向、技术栈、团队结构和最终成果由学生团队高度自主决定。
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ 5 · EXPERIENCE — dark lab / pipeline ============ */}
        <section className="section s-dark" id="experience">
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">HANDS-ON PIPELINE</span>
              <h2 className="h-title">从 Prompt 到可运行 Demo，亲手走完一条完整开发链</h2>
              <div className="pipe-flow">
                <span className="on">PROMPT</span><i>→</i>
                <span className="on">TRIPO</span><i>→</i>
                <span>BLENDER</span><i>→</i>
                <span>UNITY / UNREAL</span><i>→</i>
                <span>INTERACTION</span><i>→</i>
                <span>DEMO</span>
              </div>
            </Reveal>
            <Reveal delay={40}>
              <figure className="fig">
                <div className="fig-head">
                  <span>Real Production Pipeline</span>
                  <span className="hi">INPUT → BUILD</span>
                </div>
                <img
                  src={IMG('workflow.webp')}
                  width={1600}
                  height={1600}
                  loading="lazy"
                  decoding="async"
                  alt="带骨骼与 PBR 贴图的 3D 角色模型渲染，示意从生成到可动画角色的产出"
                />
                <figcaption className="cap">可动画的 3D 角色资产 · 公开授权模型实时渲染</figcaption>
              </figure>
            </Reveal>
            <Reveal delay={60}>
              <div className="pipeline">
                {[
                  ['01', 'INPUT', '文字或图片创意'],
                  ['02', 'GENERATE', 'TRIPO 生成 3D 角色与资产'],
                  ['03', 'REFINE', 'Blender 优化模型、材质和拓扑'],
                  ['04', 'ENGINE', '导入 Unity 或 Unreal'],
                  ['05', 'INTERACT', '添加动画、交互与游戏逻辑'],
                  ['06', 'ITERATE', '测试、迭代并完成 Demo'],
                  ['07', 'SHIP', '公开演讲与项目展示'],
                ].map(([i, en, cn]) => (
                  <div className={`stage${i === '02' ? ' key' : ''}`} key={i}>
                    <div className="idx">{i}</div>
                    <div>
                      <div className="en">{en}</div>
                      <div className="cn">{cn}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={70}>
              <div className="note-block">
                第一期方向：<b>用 AI 生成一个世界，再让它真正运行起来。</b>
              </div>
              <div className="mini-grid">
                {[
                  'AI 3D 小游戏',
                  '可交互虚拟场景',
                  'AI 生成角色与动画',
                  'XR / VR 体验',
                  '数字校园',
                  '3D 创意工具',
                  '3D 打印 / 产品原型',
                  '成员自主提出的原创项目',
                ].map((t, i) => (
                  <div className="mini" key={i}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {t}
                  </div>
                ))}
              </div>
              <p className="lead" style={{ marginTop: 18 }}>
                我们不是只学一个软件，而是完成一件真正能够运行、展示和进入作品集的作品。
              </p>
            </Reveal>
          </div>
        </section>

        {/* ============ 6 · ROADMAP — ivory / rail ============ */}
        <section className="section s-ivory two-col" id="roadmap">
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">SEMESTER ROADMAP</span>
              <h2 className="h-title">你的一个学期，将从第一次生成走向最终舞台</h2>
            </Reveal>
            <Reveal delay={60}>
              <div className="split">
              <div className="rail">
                <div className="prog" style={{ bottom: 6, top: 'auto', height: '86%' }} />
                {[
                  ['ONBOARDING', '熟悉 TRIPO、AI 3D 工作流和基础工具。'],
                  ['IDEA PITCH', '提出项目创意，找到方向相同的队友。'],
                  ['TEAM FORMATION', '组建开发、3D、产品、设计和内容团队。'],
                  ['BUILD SPRINT', '按照短周期 Sprint 开发、测试和迭代。'],
                  ['MONTHLY DEMO', '展示进度、接受反馈、解决技术问题。'],
                  ['FINAL DEMO DAY', '发布作品，完成演讲、项目视频和作品集材料。'],
                ].map(([en, d], i) => (
                  <div className={`node${i === 5 ? ' lit' : ''}`} key={i}>
                    <div className="pt">{i + 1}</div>
                    <div className="en">{en}</div>
                    <p>{d}</p>
                  </div>
                ))}
              </div>
              <figure className="fig">
                <div className="fig-head">
                  <span>Project Archive</span>
                  <span className="hi">v0.1 → v1.0</span>
                </div>
                <img
                  src={IMG('roadmap.webp')}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  alt="高精度带反光车漆材质的 3D 载具模型渲染，示意可进入引擎的成品资产"
                />
                <figcaption className="cap">可进入引擎的高精度载具资产 · 公开授权模型实时渲染</figcaption>
              </figure>
              </div>
            </Reveal>
            <Reveal delay={70}>
              <p className="pull">加入时你带来的可能只是一个想法，离开时你应该带走一件真正可以展示的作品。</p>
            </Reveal>
          </div>
        </section>

        {/* ============ 7 · RESOURCES — smoke / dashboard ============ */}
        <section className="section s-smoke" id="resources">
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">MEMBER RESOURCES</span>
              <h2 className="h-title">我们提供的不只是活动，而是把创意推向现实的资源</h2>
            </Reveal>
            <Reveal delay={60}>
              <div className="dash">
                <div className="hero-metric">
                  <div className="k">Starting TRIPO Credits</div>
                  <div className="v">3600<span style={{ fontSize: '0.42em', color: 'var(--accent-fg)', marginLeft: 8 }}>Credits</span></div>
                  <div className="u">每位成员初始约 3600 TRIPO Credits，项目需要时可申请追加生成额度。</div>
                </div>
                <div className="modules">
                  {[
                    ['COURSES', 'TRIPO 官方课程和技术内容'],
                    ['EVENTS', '官方活动、创意挑战及比赛机会'],
                    ['SUPPORT', '技术问题支持和开发反馈'],
                    ['SCALE-UP', '优秀大型项目可提交资源、经费或技术支持申请'],
                    ['REVIEW', '项目通过内部评估后，有机会获得进一步资源'],
                    ['ECOSYSTEM', '按项目需求，有机会连接 Unity 等技术生态和合作资源'],
                  ].map(([k, v]) => (
                    <div className="m" key={k}>
                      <div className="mk">{k}</div>
                      <div className="mv">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={70}>
              <p className="pull">公司不会替学生完成项目，但会帮助真正有执行力的团队走得更远。</p>
            </Reveal>
          </div>
        </section>

        {/* ============ 8 · CAREER — dark dossier ============ */}
        <section className="section s-dark two-col" id="career">
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">CAREER SIGNAL</span>
              <h2 className="h-title">最值钱的，不只是简历上的一个 Club 名字</h2>
              <p className="lead">在这里，项目就是你的申请材料，Demo 就是你的能力证明。</p>
            </Reveal>
            <Reveal delay={60}>
              <div className="split">
              <div className="dossier">
                <div className="sig">
                  <div className="row"><span className="en">PROJECT AS PROOF</span><span className="cn">项目即证明</span></div>
                  <div className="row"><span className="en">DEMO AS PORTFOLIO</span><span className="cn">Demo 即作品集</span></div>
                  <div className="row"><span className="en">EXPERIENCE AS SIGNAL</span><span className="cn">经历即信号</span></div>
                </div>
                <div className="panel">
                  <div className="sheen" />
                  <ul className="list">
                    <li>优秀成员有机会进入 TRIPO/VAST 的实习、培训或项目筛选视野</li>
                    <li>表现突出的成员有机会获得公司相关岗位和项目机会的优先关注</li>
                    <li>根据岗位匹配和项目表现，有机会连接合作生态中的实习或项目机会</li>
                    <li>项目负责人、核心开发者和优秀创作者可以形成更有说服力的作品及推荐材料</li>
                    <li>与真正的 AI 3D 产品、技术和行业需求建立连接</li>
                  </ul>
                </div>
              </div>
              <figure className="fig">
                <div className="fig-head">
                  <span>Portfolio Output</span>
                  <span className="hi">DEMO · GITHUB · DECK</span>
                </div>
                <img
                  src={IMG('career.webp')}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  alt="带 clearcoat 车漆与精细贴图的 3D 产品模型渲染，示意可放入作品集的成品资产"
                />
                <figcaption className="cap">可放入作品集的成品级 3D 资产 · 公开授权模型实时渲染</figcaption>
              </figure>
              </div>
            </Reveal>
            <Reveal delay={70}>
              <p className="pull">
                当别人还在简历上写“熟悉 Unity”“了解生成式 AI”，你已经可以直接打开一个能运行的 Demo，讲清楚自己做了什么、解决了什么问题，以及它为什么有价值。
              </p>
              <div className="disclaimer">
                实习、培训、推荐及合作机会均需根据项目表现、岗位需求和相关公司筛选确定，不构成录用保证。
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ 9 · SHOWCASE — smoke ============ */}
        <section className="section s-smoke" id="demo">
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">SHOWCASE</span>
              <h2 className="h-title">作品不是做完就结束，而是要被真正看见</h2>
            </Reveal>
            <Reveal delay={60}>
              <div className="panel">
                <div className="sheen" />
                <ul className="list">
                  <li>每月项目 Demo Review</li>
                  <li>成员介绍产品、技术路线和开发过程</li>
                  <li>优秀项目有机会进入官方内容或展示渠道</li>
                  <li>优秀团队有机会参与公司开发者分享或项目演讲</li>
                  <li>有机会参加跨校园活动、比赛和公开展示</li>
                  <li>项目可以整理成 Demo、GitHub、技术文章、项目视频和完整 Case Study</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={65}>
              <figure className="fig">
                <div className="fig-head">
                  <span>Demo Day</span>
                  <span className="hi">MODEL · CODE · INTERACTION</span>
                </div>
                <img
                  src={IMG('demo.webp')}
                  width={1600}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  alt="完整的 3D 场景：带建筑、街道、电车、招牌与灯光的城市微缩世界渲染"
                />
                <figcaption className="cap">完整可探索的 3D 场景 · 公开授权模型实时渲染</figcaption>
              </figure>
            </Reveal>
            <Reveal delay={70}>
              <p className="pull">
                你不仅要学会把产品做出来，还要学会站在台上，让别人理解它、记住它，并愿意为它提供下一步机会。
              </p>
              <button className="btn-text" onClick={() => scrollToId('join')}>
                想了解核心项目组？联系招新负责人 <span className="arw">→</span>
              </button>
            </Reveal>
          </div>
        </section>

        {/* ============ 10 · JOIN — dark titanium / QR ============ */}
        <section className="section s-dark qr-section glow" id="join" ref={joinRef}>
          <div className="qr-deco" aria-hidden="true">
            <svg viewBox="0 0 300 360" fill="none" stroke="#b8c0c8" strokeWidth="1">
              <g transform="translate(150 170)">
                <ellipse rx="120" ry="150" />
                <path d="M-120 0 Q0 50 120 0 M-96 -66 Q0 -16 96 -66 M-80 70 Q0 120 80 70 M0 -150 L0 150" />
              </g>
            </svg>
          </div>
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">JOIN US</span>
              <h2 className="h-title">AI 3D 不只属于程序员</h2>
              <div className="chips">
                {[
                  'Unity / Unreal / 游戏开发',
                  'Python / AI / 后端与工具开发',
                  'Blender / 3D 建模 / 动画',
                  'UI/UX / 视觉设计',
                  '产品经理 / 项目管理',
                  '建筑 / 艺术 / 工业设计',
                  '内容运营 / 摄影 / 视频制作',
                  '对 AI 3D 感兴趣的零基础成员',
                ].map((t, i) => (
                  <span className={`chip${i % 3 === 0 ? ' k' : ''}`} key={i}>
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={60}>
              <div className="statement" style={{ marginTop: 28 }}>
                <div className="sheen" />
                <p>
                  下一批 AI 3D 作品，不应该只是被你刷到。
                  <br />
                  它们可以由你<span className="ice">亲手做出来</span>。
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="qr-title">联系人微信</div>
              <div className="qr-frame">
                <div className="qr-card">
                  <img
                    src={QR_SRC}
                    width={888}
                    height={1131}
                    alt="联系人微信二维码，长按识别添加"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
              <p className="qr-line">长按识别二维码，添加联系人</p>
              <p className="qr-note">
                添加时请备注：<b>姓名＋专业＋年级＋TRIPO</b>
              </p>
              <p className="qr-note">想进入核心项目组的同学，可以同时注明感兴趣的方向。</p>
              <div className="btn-row">
                <button className="btn btn-primary" onClick={() => scrollToId('join')}>
                  添加联系人微信
                </button>
              </div>
              <p className="qr-remark">请长按二维码识别</p>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="foot s-dark">
        <div className="wrap">
          <div>UW–Madison TRIPO AI 3D Club · 2026 Fall Recruitment</div>
          <p className="fine">具体活动安排、资源支持及机会以项目实际进展和相关方审核为准。</p>
        </div>
      </footer>

      <div className={`cta-bar${ctaHidden ? ' hidden' : ''}`} role="region" aria-label="加入 TRIPO AI 3D Club">
        <div className="cta-brand">
          <span className="mk"><BrandMark /></span>
          <span className="tx">TRIPO AI 3D</span>
        </div>
        <button className="btn btn-primary" onClick={() => scrollToId('join')}>
          立即加入
        </button>
      </div>
    </div>
  )
}
