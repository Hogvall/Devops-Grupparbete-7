import os
import requests
import google.generativeai as genai

# --- Setup ---
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
PR_NUMBER = os.environ["PR_NUMBER"]
REPO = os.environ["REPO"]

genai.configure(api_key=GEMINI_API_KEY)

# --- Fetch PR diff ---
diff_url = f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}"
headers = {"Authorization": f"token {GITHUB_TOKEN}"}

pr_data = requests.get(diff_url, headers=headers).json()
patches = []

files_url = pr_data["url"] + "/files"
files = requests.get(files_url, headers=headers).json()

for f in files:
    if "patch" in f:
        patches.append(f"File: {f['filename']}\n{f['patch']}")

diff_text = "\n\n".join(patches)

# --- Ask Gemini for a review ---
prompt = f"""
You are a senior software engineer reviewing a GitHub pull request.

Provide:
- A high-level summary
- Specific issues or risks
- Suggested improvements
- Code-quality notes

Here is the diff:

{diff_text}
"""

model = genai.GenerativeModel("gemini-1.5-pro")
response = model.generate_content(prompt)
review_text = response.text

# --- Post review back to GitHub ---
comment_url = f"https://api.github.com/repos/{REPO}/issues/{PR_NUMBER}/comments"
payload = {"body": f"### 🤖 Gemini Review\n\n{review_text}"}

requests.post(comment_url, json=payload, headers=headers)