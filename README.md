# Import Conference Schedule

This is a silly little project to populate a Google Spreadsheet with
data from an ics file, and populate my "Conferences From Around The
World" spreadsheet.

# CUSTOMIZING

## Google Spreadsheet

First, create a google spreadsheet to store your information.
If you have headers and what not before the cell where you will
fill with the scraped data, remember how many rows down you will
start from.

For example, If you are going to start ading data from row 5, you will
have to change the value of `startColumn` in the script.gs file.

The rows that we expect are:

* Start Date
* End Date
* Country (not populated by this tool)
* City (not populated by this tool)
* Conference Name
* Expected Number of Attendees (not populated by this tool)
* URL of the conference
* Comment

Later on, you will add a Google Script to be run against this spreadsheet.

## Deploy ical2json

Parsing ical/ics files is a nightmare in Javascript/Google Script.
Well, it can be done, but you don't want to do that. I wrote a middleware
to intercept an ical file from a remote URL, and convert it to JSON,
which is much easier to work with.

Simply deploy this to Google App Engine. I recommend checking your
quotas and make sure that it only runs on the free-quota range, or send
me a patch for some authentication mechanism (I know, I can do it, but
I didn't need it when I wrote it).

To deploy, setup your Google account, a project for this app, and then
create an `app.yaml` file. There's a sample in this repository.

Then deploy using:

```sh
goapp deploy -application YOUR_APPLICATION_ID
```

You should have a service up. Remember the URL, which you will use in the
Google Script after this.

## Setup Google Script

From your Google Spreadsheet, go to Tools > Script Editor.

Paste the contents of `script.gs` to the editor.

Change the following variables

| name | description |
|:-----|:------------|
| startColumn | Row number where you start filling the sheet with data |
| converterURL | URL of your Google App Engine app, including the "/convert" path |
| targetURL | URL of the ics file that you want to scrape. Note that we assume opensource.com's structure, so you may need to tweak the script a little to fit your needs |

## Finally

Run the `appendData` function from your script console. You should see all the rows
filled with the data.
