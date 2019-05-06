#!/usr/bin/env python
# coding: utf-8


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

for key, value in enumerate(headers):
    capability_key = 'phantomjs.page.customHeaders.{}'.format(key)
    webdriver.DesiredCapabilities.PHANTOMJS[capability_key] = value

print("creating browser...")
browser = webdriver.PhantomJS()

def scroll_to_bottom(driver, iterations):
    for _ in tqdm(range(iterations)):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(abs(random.gauss(4, 0.3)))
    
def get_subreddit_imgur_jpg_links(driver, subreddit, length = 200):
    print("subreddit: /r/{}".format(subreddit))
    driver.get("https://www.reddit.com/r/{}/top/?t=all".format(subreddit))
    scroll_to_bottom(driver, length)
    links = driver.find_elements_by_css_selector("a[href*=\".jpg\"]")
    tops = [link.get_attribute('href') for link in links]
    
    driver.get("https://www.reddit.com/r/{}/hot".format(subreddit))
    scroll_to_bottom(driver, length)
    links = driver.find_elements_by_css_selector("a[href*=\".jpg\"]")
    hots = [link.get_attribute('href') for link in links]
    images = list(set(tops + hots))
    print("found {} images\n".format(len(images)))

    return images


res = {}
for subreddit in ["ladyboners", "hotguys", "prettygirls", "beautifulfemales"]:
    res[subreddit] = get_subreddit_imgur_jpg_links(browser, subreddit)


with open("ladyboners_hotguys_prettygirls_beautifulfemales.json", "w") as outfile:
    json.dump(res, outfile)
