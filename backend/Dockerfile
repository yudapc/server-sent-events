# Start from the official Golang base image
FROM golang:1.21.10-alpine3.20 as builder

# Install gcc and sqlite
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source from the current directory to the Working Directory inside the container
COPY . .

# Build the Go app
RUN GOOS=linux go build -ldflags="-s -w" -o main

######## Start a new stage from scratch #######
FROM golang:1.21.10-alpine3.20

RUN apk --no-cache add ca-certificates sqlite-libs

WORKDIR /root/

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/main .

# Set environment variables
ENV DB_DRIVER=sqlite3
ENV DB_URL=./database.db
ENV ALLOWED_ORIGINS=http://localhost:3000,httplocalhost:8000
ENV SECRET_KEY=secret

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./main"]