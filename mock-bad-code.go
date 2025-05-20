package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/smtp"
	"os"
)

const (
	// Hardcoded API key (should never be in code)
	API_KEY = "sk_live_51H8s3cr3tPr0duct10nK3y"

	// Hardcoded database credentials
	DB_USER     = "prod_admin"
	DB_PASSWORD = "SuperSecretProdPassword123!"
	DB_HOST     = "prod-db.company.internal"
	DB_NAME     = "production_db"
)

func main() {
	// Example: Connecting to a production database with hardcoded credentials
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s", DB_USER, DB_PASSWORD, DB_HOST, DB_NAME)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to production database: %v", err)
	}
	defer db.Close()

	// Example: Logging sensitive user information
	userEmail := "ceo@company.com"
	userPassword := "P@ssw0rd!"
	log.Printf("User login attempt: email=%s, password=%s", userEmail, userPassword)

	// Example: Sending email with hardcoded SMTP credentials
	smtpHost := "smtp.production.company.com"
	smtpPort := "587"
	auth := smtp.PlainAuth("", "noreply@company.com", "ProdEmailPassword!", smtpHost)
	err = smtp.SendMail(
		smtpHost+":"+smtpPort,
		auth,
		"noreply@company.com",
		[]string{"admin@company.com"},
		[]byte("Subject: Production Alert\n\nSensitive operation performed."),
	)
	if err != nil {
		log.Printf("Failed to send email: %v", err)
	}

	// Example: Exposing a private key in code
	privateKey := `
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA7v1b2Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1
k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw1k3Qw
...
-----END RSA PRIVATE KEY-----
`
	fmt.Println("Loaded private key:", privateKey[:30], "...")

	// Example: Using a production API endpoint
	resp, err := os.Open("https://api.production.company.com/v1/data")
	if err != nil {
		log.Printf("Failed to call production API: %v", err)
	}
	defer resp.Close()
}
