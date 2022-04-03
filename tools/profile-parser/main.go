package main

import (
	"bufio"
	"flag"
	"fmt"
	"math"
	"os"
	"strconv"
	"strings"
)

// parser ps record file
// ps aux | grep frp >> /tmp/ps.log

// usage: ./main --file=xxx --pid=yyy

func main() {
	file := flag.String("file", "", "tcpdump sniffer file")
	pid := flag.String("pid", "-1", "pid")

	flag.Parse()

	handleProfileContent(*file, *pid)
}

func handleProfileContent(file string, pid string) {
	fp, err := os.Open(file)
	if err != nil {
		panic(err)
	}
	defer fp.Close()

	buf := bufio.NewScanner(fp)

	var (
		firstMemPercent float64 = -1
		firstMemRSS     int     = -1
		lastMemPercent  float64 = -1
		lastMemRSS      int     = -1

		minMemRSS int = math.MaxInt32
		maxMemRSS int = math.MinInt32

		totalRSS int = 0
		count    int = 0
	)

	for {
		if !buf.Scan() {
			break
		}
		line := buf.Text()

		// USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
		strs := strings.Fields(strings.TrimSpace(line))

		if len(strs) >= 10 && strs[1] == pid {
			count++

			// %MEM
			if lastMemPercent, err = strconv.ParseFloat(strings.TrimSpace(strs[3]), 64); err != nil {
				panic(err)
			}
			// RSS
			if lastMemRSS, err = strconv.Atoi(strings.TrimSpace(strs[5])); err != nil {
				panic(err)
			}

			totalRSS += lastMemRSS

			if firstMemPercent == -1 {
				firstMemPercent = lastMemPercent
				firstMemRSS = lastMemRSS
			}

			if minMemRSS > lastMemRSS {
				minMemRSS = lastMemRSS
			}

			if maxMemRSS < lastMemRSS {
				maxMemRSS = lastMemRSS
			}
		}
	}

	fmt.Printf("file: %v parse finish\n", file)

	fmt.Printf("first mem percent: %v,\nfirst mem RSS: %v,\nlast mem percent: %v,\nlast mem RSS: %v,\nmin mem RSS: %v,\nmax mem RSS: %v,\navg mem RSS: %v,\nrecord num: %v\n", firstMemPercent, firstMemRSS, lastMemPercent, lastMemRSS, minMemRSS, maxMemRSS, divive(totalRSS, count), count)
}

func divive(total, num int) float64 {
	if num == 0 {
		return 0
	}
	return float64(total) / float64(num)
}
