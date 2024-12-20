import { useState, useRef, useEffect } from 'react'
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Paper,
  Typography,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const INITIAL_PROMPTS = [
  "How should AI-generated content be moderated when users request information on controversial topics, and who should decide those moderation standards?",
  "To what extent should AI assistants be allowed to produce content that aligns with user biases, and how do we prevent harm if those biases are discriminatory?",
  "What responsibilities do developers and providers of AI services have in ensuring that personalized recommendations do not lead to harmful or unethical outcomes?",
  "Should AI assistants offer guidance on sensitive areas like mental health or financial decisions, and if so, what checks should be in place to ensure reliability and safety?",
  "When it comes to content aimed at younger audiences, what additional measures should be taken to ensure that personalization does not expose children to harmful ideas or information?",
  "How can we balance the user's right to receive tailored information with the broader societal interest in preventing the spread of misinformation or extremist content?",
  "To what extent should AI assistants adapt their style, tone, or communication approach based on individual user preferences, and when might these preferences conflict with broader ethical standards?",
  "Should AI systems ever refuse user requests based on moral or ethical judgments, and if so, who defines these moral and ethical boundaries?",
  "What kind of transparency or disclosure should AI assistants provide to users about how their personalized outputs are generated, and how might this transparency shape user trust?",
  "As personalization capabilities grow, how should we handle situations where users request content that normalizes harmful behavior or encourages unhealthy habits?"
]

const wrapPrompt = (prompt: string) => `You are participating in a large-scale deliberation about:

**"${prompt}"**

Here is the process breakdown:

1. You'll see a topic-related statement and can respond with your position.
2. Based on your responses, you'll be grouped with participants sharing similar opinions.
3. Propose statements for other participants to consider.

**Goal**: Propose statements that achieve agreement among people with opposing views.

**Agree, disagree, or skip this statement? Please explain your choice.**`

const getRandomPrompt = () => wrapPrompt(INITIAL_PROMPTS[Math.floor(Math.random() * INITIAL_PROMPTS.length)])

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const initialPrompt = getRandomPrompt()
    return [
      {
        role: 'system',
        content: initialPrompt
      }
    ]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat', {
        messages: messages.concat(userMessage)
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getMessageBackgroundColor = (role: string) => {
    switch (role) {
      case 'user':
        return '#e3f2fd'
      default:
        return '#f5f5f5'
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  backgroundColor: getMessageBackgroundColor(message.role),
                  maxWidth: '70%',
                  '& p': { margin: 0 },
                  '& p:not(:last-child)': { marginBottom: '1em' },
                  '& ol': { marginTop: 0, marginBottom: '1em', paddingLeft: '1.5em' },
                  '& li': { marginBottom: '0.5em' }
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Paper>
            </ListItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <SendIcon />
              </IconButton>
            )
          }}
        />
      </Box>
    </Box>
  )
}

export default ChatInterface 