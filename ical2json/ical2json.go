package ical2json

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"

	ical "github.com/lestrrat/go-ical"

	"google.golang.org/appengine"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/urlfetch"
)

func init() {
	http.HandleFunc(`/convert`, func(w http.ResponseWriter, r *http.Request) {
		u := r.FormValue(`url`)
		if u == "" {
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			return
		}
		if _, err := url.Parse(u); err != nil {
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			return
		}

		ctx := appengine.NewContext(r)
		client := urlfetch.Client(ctx)

		res, err := client.Get(u)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}
		defer res.Body.Close()

		p := ical.NewParser()
		c, err := p.Parse(res.Body)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		log.Infof(ctx, "%#v", c)

		var buf bytes.Buffer
		if err := json.NewEncoder(&buf).Encode(c); err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json;charset=utf-8")
		w.Header().Set("Content-Length", strconv.Itoa(buf.Len()))
		buf.WriteTo(w)
	})
}
