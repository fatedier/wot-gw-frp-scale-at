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
// sudo tcpdump -i any -nn port 7000 > /tmp/tcpdump.log

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

	allBytes := 0
	packetNums := 0

	reg := regexp.MustCompile(`.*length ([0-9]+):`)

	for {
		if !buf.Scan() {
			break
		}
		line := buf.Text()

		if strings.Contains(line, "IP") && strings.Contains(line, "Flags") {
			packetNums++

			strs := reg.FindStringSubmatch(line)
			if len(strs) == 2 {
				temp, err := strconv.Atoi(strs[1])
				if err != nil {
					fmt.Println("invalid number")
				} else {
					allBytes += temp
				}
			}
		}
	}

	fmt.Printf("file: %v parse finish\nbytes: %v, packet numbers: %v\n", tcpdumpFile, allBytes, packetNums)
}
