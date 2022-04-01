package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
)

// tcpdump capture in frpc machine and save to file
// sudo tcpdump -i any -vnn port 7000 > /tmp/tcpdump.log

// usage: ./main --file=xxx

func main() {
	file := flag.String("file", "", "tcpdump sniffer file")

	flag.Parse()

	handleTcpdumpContent(*file)
}

func handleTcpdumpContent(tcpdumpFile string) {
	fp, err := os.Open(tcpdumpFile)
	if err != nil {
		panic(err)
	}
	defer fp.Close()

	buf := bufio.NewScanner(fp)

	inBytes := 0  // frps -> frpc
	outBytes := 0 // frpc -> frps

	reg := regexp.MustCompile(`.*length ([0-9]+)\)`)

	for {
		if !buf.Scan() {
			break
		}

		line := buf.Text()

		if strings.Contains(line, "Out IP") {
			temp, err := strconv.Atoi(reg.FindStringSubmatch(line)[1])
			if err != nil {
				panic(err)
			}
			outBytes += temp
		} else if strings.Contains(line, "In  IP") {
			temp, err := strconv.Atoi(reg.FindStringSubmatch(line)[1])
			if err != nil {
				panic(err)
			}
			inBytes += temp
		} else {
			// ignore
		}
	}

	fmt.Printf("file: %v parse finish\nin bytes: %v, out bytes: %v\n", tcpdumpFile, inBytes, outBytes)
}
