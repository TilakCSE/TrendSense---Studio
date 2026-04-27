# Start from a solid Python 3.11 foundation
FROM python:3.11

# Set the working directory
WORKDIR /code

# Copy the requirements file and install dependencies
# (We do this first to cache the massive PyTorch downloads!)
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the rest of your backend code
COPY . .

# Hugging Face Spaces ALWAYS route traffic to port 7860
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]