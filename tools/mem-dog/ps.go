package main

import (
	"bufio"
	"fmt"
	"io"
	"os/exec"
	"strings"
)

func psOnce() (string, error) {
	cmd := exec.Command("/bin/bash", "-c", `ps aux|grep frp|grep -v 'grep'`)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		fmt.Printf("Error:can not obtain stdout pipe for command:%s\n", err)
		return "", err
	}

	if err := cmd.Start(); err != nil {
		fmt.Println("Error:The command is err,", err)
		return "", err
	}

	outputBuf := bufio.NewReader(stdout)

	var b strings.Builder

	for {
		output, _, err := outputBuf.ReadLine()
		if err != nil {
			if err == io.EOF {
				break
			}
			fmt.Printf("Error :%s\n", err)
		}

		b.WriteString(string(output) + "\n")
	}

	if err := cmd.Wait(); err != nil {
		fmt.Println("wait:", err)
		return "", err
	}

	return b.String(), nil
}
