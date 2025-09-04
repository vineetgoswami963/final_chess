# First stage: Build
FROM node:14 AS builder

# Install necessary tools and older Python version (if Railway's environment allows it)
RUN apt-get update && \
    apt-get install -y python3.10 && \
    ln -sf /usr/bin/python3.10 /usr/bin/python

# Set the working directory
WORKDIR /app

# Copy project files to the container
COPY . .

# Install npm dependencies
RUN npm install

# Build the project if necessary
RUN npm run build

# Second stage: Serve with a minimal image
FROM node:14-slim

# Set the working directory
WORKDIR /app

# Copy only the built files from the builder stage
COPY --from=builder /app .

# Install only production dependencies
RUN npm install --only=production

# Expose the port your app runs on (change this if needed)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
