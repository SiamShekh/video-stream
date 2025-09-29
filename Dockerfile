FROM ubuntu:latest

# Install dependencies
RUN apt update -y && \
    apt upgrade -y && \
    apt install -y curl ffmpeg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Set working directory
WORKDIR /video

# Copy files
COPY . .

# Install npm dependencies
RUN npm install

# Start the app
CMD ["node", "index.js"]
