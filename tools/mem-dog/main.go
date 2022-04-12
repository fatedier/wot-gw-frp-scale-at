package main

import (
	"fmt"
	"os"
	"strings"
	"sync"
	"time"
)

/*
	1. When ps is called, the data is written to mem.log.
	2. After ps is called, the data is analyzed and the statistics are calculated.
	3. The statistics are written to mem_statics.csv.
	4. The statistics are plotted in Excel.

	usage:
	go build -o mem-dog
	./mem-dog to run
*/

const (
	csvColumns       = "Time,Type,MaxMem,MinMem,TotalPidUsage,PidCount,SVCCount,AVGPidMem,AVGSVCMem,SysMemUsage"
	csvColumnsFormat = "%v,%v,%v,%v,%v,%v,%v,%v,%v,%v"
)

func main() {
	psChan := make(chan string)

	logfile, err := os.OpenFile("mem.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}
	defer logfile.Close()

	statfile, err := os.OpenFile("mem_statics.csv", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}
	defer statfile.Close()

	_, err = statfile.WriteString(csvColumns + "\n")
	if err != nil {
		panic(err)
	}

	wg := new(sync.WaitGroup)
	wg.Add(2)

	go func() {
		defer wg.Done()

		for {
			ps, err := psOnce()
			if err != nil {
				fmt.Println("ps get err:", err)
				time.Sleep(time.Second * 10)
				continue
			}
			psChan <- ps

			go logfile.WriteString(ps)

			time.Sleep(time.Second * 60)
		}
	}()

	go func() {
		defer wg.Done()

		for {
			select {
			case ps := <-psChan:
				lines := strings.Split(strings.TrimSpace(ps), "\n")
				frpcStatics, frpsStatics := ParseLine(lines)

				for _, s := range []MemStatics{frpcStatics, frpsStatics} {
					format := fmt.Sprintf(csvColumnsFormat,
						s.StartTime,
						s.Type,
						s.MaxMem,
						s.MinMem,
						s.TotalPidUsage,
						s.PidCount,
						s.SVCCount,
						s.AVGPidMem,
						s.AVGSVCMem,
						s.SysMemUsage,
					)
					fmt.Println("format and write to file: ", format)
					statfile.WriteString(format + "\n")
				}
			}
		}
	}()

	wg.Wait()

	fmt.Println("done...")
}
