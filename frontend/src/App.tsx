import { useState } from 'react'
import { Container, Box, Paper } from '@mui/material'
import ChatInterface from './components/ChatInterface'
import './App.css'

function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ height: '100vh', py: 4 }}>
        <Paper elevation={3} sx={{ height: '90vh', overflow: 'hidden' }}>
          <ChatInterface />
        </Paper>
      </Box>
    </Container>
  )
}

export default App
