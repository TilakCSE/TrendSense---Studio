import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { TrendNode } from './components/3D/TrendNode'
import TopBar from './components/Dashboard/TopBar'
import LeftPanel from './components/Dashboard/LeftPanel'
import RightPanel from './components/Dashboard/RightPanel'
import { usePrediction } from './hooks/usePrediction'

function App() {
  // --- Real API Integration ---
  const { status, data, predict } = usePrediction()
  const [caption, setCaption] = useState('')
  const [simulatedHour, setSimulatedHour] = useState(12) // Default to noon

  const [liveTrends] = useState([
    '🔥 Trending now: #skibidi',
    '#AGI',
    '#economy',
    '#SaaS',
    '#TrendSense',
    '#OpenSource',
    '#AIContent'
  ])

  // --- Real API Predict Handler ---
  const handlePredict = async () => {
    await predict(caption, simulatedHour)
  }

  const isPredicting = status === 'loading'
  const showResults = status === 'success' && data !== null

  return (
    <div className="relative w-full h-screen bg-[#030303] overflow-hidden text-white">
      {/* 1. Scrolling Ticker */}
      <TopBar trends={liveTrends} />

      {/* 2. Interactive 3D Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#030303]">
        <Canvas
          shadows
          className="w-full h-full r3f-canvas"
          style={{ background: '#030303' }}
          camera={{ position: [0, 0, 5], fov: 50 }}
        >
          <Suspense fallback={null}>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
            />

            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#00FF88" />
            <spotLight position={[-5, 5, 5]} angle={0.15} penumbra={1} intensity={2} color="#00FF88" />

            <Physics gravity={[0, 0, 0]}>
              <TrendNode isPredicting={isPredicting} />
            </Physics>

            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.4} far={4.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* 3. Floating Particles Background Overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none grid-pattern opacity-20" />

      {/* 4. Dashboard Panels */}
      <main className="relative z-10 w-full h-full pt-16 px-8 flex flex-col lg:flex-row gap-8 items-start justify-center lg:items-center">
        <LeftPanel
          caption={caption}
          setCaption={setCaption}
          simulatedHour={simulatedHour}
          setSimulatedHour={setSimulatedHour}
          isPredicting={isPredicting}
          onPredict={handlePredict}
        />

        <RightPanel
          isVisible={showResults}
          data={data ? {
            viralityIndex: data.virality_index,
            sentimentScore: data.sentiment_score,
            topFeatures: data.top_features,
            aiSuggestion: data.ai_suggestion
          } : {
            viralityIndex: 0,
            sentimentScore: 0,
            topFeatures: [],
            aiSuggestion: ''
          }}
        />
      </main>

      {/* Branding / Watermark */}
      <div className="fixed bottom-6 right-8 text-right z-20 pointer-events-none opacity-30 select-none">
        <h1 className="text-2xl font-display uppercase tracking-widest text-neon-glow">TrendSense <span className="text-neon-green">AI</span></h1>
        <p className="text-[10px] tracking-[0.4em] font-mono-custom">PRECISION NEURAL ENGINE V1.6</p>
      </div>
    </div>
  )
}

export default App
