from faker import Faker
import numpy as np
import datetime
import click
import time
import json
import random
import pprint

pp = pprint.PrettyPrinter(indent=4)


def profile_gender(sex):
    female_gender = [
      'FEMALE',
      'MTF']

    male_gender = [
      'MALE',
      'FTM']

    gender = female_gender if sex == 'F' else male_gender
    return np.random.choice(gender, p=[0.95, 0.05])


def sexual_orientation():
    orientation = [
        'HETEROSEXUAL',
        'HOMOSEXUAL',
        'BISEXUAL']
    return np.random.choice(orientation, p=[0.6, 0.2, 0.2])

@click.command()
@click.option('--count', default=1000, help = 'Number of profiles to generate')
@click.option('--filename', default='fake_profiles.json', help = 'Name of the output file')
def generate_fake_profiles(count, filename):
    fake = Faker('fr_FR')

    start = time.time()
    profiles = []
    for _ in range(count):
        profile = fake.profile()
        profile['position'] = fake.local_latlng(country_code="FR", coords_only=True)
        dob = profile['birthdate']
        profile['birthdate'] = dob.strftime("%Y-%m-%d")
        name = profile['name'].split(' ')
        first_name = name[0]
        last_name = ' '.join(name[1:])
        profile['firstName'] = first_name
        profile['lastName'] = last_name
        profile['gender'] = profile_gender(profile['sex'])
        profile['bio'] = fake.text(max_nb_chars = 200)
        profile['numPics'] = 1
        profile['urlPp'] = fake.image_url()
        profile['sexualOrientation'] = sexual_orientation()
        profile['email'] = profile['mail']
        profile.pop('mail')

        profile.pop('blood_group')
        profile.pop('address')
        profile.pop('company')
        profile.pop('job')
        profile.pop('name')
        profile.pop('residence')
        profile.pop('sex')
        profile.pop('ssn')
        profile.pop('website')
        profile.pop('current_location')

        profiles.append(profile)

    with open(filename, 'w') as outfile:
        json.dump(profiles, outfile)


    end = time.time()
    print('Took {} secs to generate {} profiles in {}\n'.format(end-start, len(profiles), filename))


if '__main__' == __name__:
    generate_fake_profiles()

