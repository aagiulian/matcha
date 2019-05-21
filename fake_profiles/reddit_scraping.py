#!/usr/bin/env python
# coding: utf-8

import concurrent.futures
from selenium import webdriver
from tqdm import tqdm
import json
import time
import random


headers = { 'Accept':'*/*',
    'Accept-Encoding':'gzip, deflate, sdch',
    'Accept-Language':'en-US,en;q=0.8',
    'Cache-Control':'max-age=0',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
}

def scroll_to_bottom(driver, iterations):
    increments = 4 
    for _ in range(iterations):
        for i in range(increments):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(abs(random.gauss(6.0/float(increments), 0.3)))
        

def get_subreddit_imgur_jpg_links(driver, subreddit, length = 10):
    print("subreddit: /r/{}".format(subreddit))
    driver.get("https://www.reddit.com/r/{}/top/?t=all".format(subreddit))
    scroll_to_bottom(driver, length)
    links = driver.find_elements_by_css_selector("a[href*=\".jpg\"]")
    tops = [link.get_attribute('href') for link in links]
    print("found {} images in /r/{}/top/?t=all".format(len(tops), subreddit))
    
    driver.get("https://www.reddit.com/r/{}/hot".format(subreddit))
    scroll_to_bottom(driver, length)
    links = driver.find_elements_by_css_selector("a[href*=\".jpg\"]")
    hots = [link.get_attribute('href') for link in links]
    print("found {} images in /r/{}/hot".format(len(hots), subreddit))
    images = list(set(tops + hots))

    return images


def scrap_subreddit(subreddit):
    for key, value in enumerate(headers):
        capability_key = 'phantomjs.page.customHeaders.{}'.format(key)
        webdriver.DesiredCapabilities.PHANTOMJS[capability_key] = value
    browser = webdriver.PhantomJS()
    return get_subreddit_imgur_jpg_links(browser, subreddit)
    

subreddits = ["ladyboners", "hotguys", "prettygirls", "beautifulfemales"]
#subreddits = ["blep", "catpictures", "blop", "dogpictures"]

res = {}

with concurrent.futures.ProcessPoolExecutor(max_workers=4) as executor:
    images = list(executor.map(scrap_subreddit, subreddits))
    for i,sub in enumerate(subreddits):
        res[sub] = images[i]

filename_out = "-".join(subreddits) + ".json"
with open(filename_out, "w") as outfile:
    json.dump(res, outfile)
