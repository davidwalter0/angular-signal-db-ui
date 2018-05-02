package main

import (
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"

	"github.com/davidwalter0/go-cfg"
)

// App vars for flags or environment setup
type App struct {
	Password string `json:"password" doc:"enter a password using an environment variable or flag"`
}

var app App

func init() {
	var err error
	if err = cfg.Process("", &app); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func main() {
	var password = []byte(app.Password)
	// Hashing the password with the default cost of 10
	hashedPassword, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(hashedPassword))

	// Comparing the password with the hash
	err = bcrypt.CompareHashAndPassword(hashedPassword, password)
	// fmt.Println("Verifying password:", err == nil) // nil means it is a match
	if err == nil {
		os.Exit(0)
	} else {
		os.Exit(1)
	}
}
