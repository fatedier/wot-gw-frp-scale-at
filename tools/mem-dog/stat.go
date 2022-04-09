package main

import (
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/mackerelio/go-osstat/memory"
)

type MemStatics struct {
	StartTime     string `json:"start_time"`
	Type          string `json:"type"`
	MaxMem        int    `json:"max_mem"`
	MinMem        int    `json:"min_mem"`
	TotalPidUsage int    `json:"total_pid_usage"`
	PidCount      int    `json:"pid_count"`
	SVCCount      int    `json:"svc_count"`
	AVGPidMem     int    `json:"avg_pid_mem"`
	AVGSVCMem     int    `json:"avg_svc_mem"`
	SysMemUsage   int    `json:"sys_mem_usage"`
}

func ParseLine(lines []string) (MemStatics, MemStatics) {
	frpcStatics := MemStatics{
		StartTime: time.Now().UTC().Format(time.RFC3339),
		Type:      "frpc",
		MaxMem:    math.MinInt,
		MinMem:    math.MaxInt,
	}

	frpsStatics := MemStatics{
		StartTime: time.Now().UTC().Format(time.RFC3339),
		Type:      "frps",
		MaxMem:    math.MinInt,
		MinMem:    math.MaxInt,
	}

	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		partials := strings.Fields(line)

		// macOS: USER  PID  %CPU %MEM  VSZ RSS  TT  STAT STARTED  TIME COMMAND
		// linux: USER  PID  %CPU %MEM  VSZ RSS TTY  STAT START   TIME COMMAND
		if len(partials) < 10 {
			continue
		}

		v, err := strconv.Atoi(partials[5])
		if err != nil {
			panic(err)
		}

		if strings.Contains(line, "frpc -c") || strings.Contains(line, "frpc --config_dir") {
			frpcStatics.TotalPidUsage += v
			frpcStatics.PidCount++
			if frpcStatics.MaxMem < v {
				frpcStatics.MaxMem = v
			}
			if frpcStatics.MinMem > v {
				frpcStatics.MinMem = v
			}
		} else if strings.Contains(line, "frps -c") {
			frpsStatics.TotalPidUsage += v
			frpsStatics.PidCount++
			if frpsStatics.MaxMem < v {
				frpsStatics.MaxMem = v
			}
			if frpsStatics.MinMem > v {
				frpsStatics.MinMem = v
			}
		}
	}

	memory, err := memory.Get()
	if err != nil {
		panic(err)
	}

	frpcStatics.SysMemUsage = int(memory.Used)
	frpcStatics.AVGPidMem = int(divive(frpcStatics.TotalPidUsage, frpcStatics.PidCount))

	frpsStatics.SysMemUsage = int(memory.Used)
	frpsStatics.AVGPidMem = int(divive(frpsStatics.TotalPidUsage, frpsStatics.PidCount))

	return frpcStatics, frpsStatics
}

func divive(total, num int) float64 {
	if num == 0 {
		return 0
	}
	return float64(total) / float64(num)
}
