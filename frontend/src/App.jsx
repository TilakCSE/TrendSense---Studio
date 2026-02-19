import { useState } from 'react'
import './index.css'

function App() {
  const [virality, setVirality] = useState(null)
  const [caption, setCaption] = useState('')

  const handlePredict = () => {
    // Generate random number between 50 and 100
    const prediction = Math.floor(Math.random() * (100 - 50 + 1)) + 50
    setVirality(prediction)
  }

  return (
    <div className="dashboard-container">
      <h1 className="title">TrendSense AI</h1>
      
      <div className="card input-card">
        <textarea
          className="caption-input"
          placeholder="Enter your post caption here..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
        />
        
        <button className="predict-btn" onClick={handlePredict}>
          Predict Virality
        </button>
      </div>

      {virality !== null && (
        <div className="card result-card">
          <h2>Predicted Virality</h2>
          <div className="virality-score">
            {virality}%
          </div>
        </div>
      )}
    </div>
  )
}

export default App
