from faker import Faker
import datetime
import click
import time
import json


@click.command()
@click.option('--count', default=1000, help = 'Number of profiles to generate')
@click.option('--filename', default='fake_profiles.json', help = 'Name of the output file')
def generate_fake_profiles(count, filename):
    fake = Faker('fr_FR')

    start = time.time()
    profiles = []
    for _ in range(count):
        profile = fake.profile()
        profile['current_location'] = fake.local_latlng(country_code="FR", coords_only=True)
        dob = profile['birthdate']
        profile['birthdate'] = dob.strftime("%Y-%m-%d")
        profiles.append(profile)

    with open(filename, 'w') as outfile:
        json.dump(profiles, outfile)

    end = time.time()
    print("Took {} secs to generate {} profiles in {}\n".format(end-start, len(profiles), filename))


if '__main__' == __name__:
    generate_fake_profiles()

