from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import openai
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure OpenAI
client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/api/chat', methods=['POST'])
def chat():
    print("Chat endpoint hit")
    try:
        data = request.json
        messages = data.get('messages', [])
        
        # Ensure system message is properly formatted
        if messages and messages[0]['role'] == 'system':
            system_content = messages[0]['content']
            # Remove the original system message from the array
            messages = messages[1:]
            # Add it back as a proper system message
            messages.insert(0, {"role": "system", "content": system_content})
        
        # Call OpenAI API with new client syntax
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        
        return jsonify({
            'message': response.choices[0].message.content,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':    
    app.run(debug=True, host='127.0.0.1', port=5000) 

