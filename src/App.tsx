import React from 'react'
import { Dashboard } from './components/Dashboard'
import { ThemeProvider } from './components/ThemeToggle'
import './App.css'
import './styles/accessibility.css'
import './styles/interactive.css'
import './styles/themes.css'

function App() {
  console.log('🎨 App loaded with Theme Provider!');
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}

export default App