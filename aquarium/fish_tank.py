import os
import pygame
import sys
import pygame.surfarray as surfarray
import numpy as np
from azure.storage.blob import BlobServiceClient
import random
from dotenv import load_dotenv
import threading
import math

# Get the connection string and container name from environment variables
load_dotenv()
connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME")

known_files_file = os.getcwd() + "/known_files.txt"
fish_directory = os.getcwd() + "/fish"
star_fish_directory = os.getcwd() + "/starfish"

fish_limit = 40
load_method = os.getenv("METHOD").lower() #azure or local
local_directory =  os.getenv("LOCAL_PATH")

#delete all files in fish and the Known_files.txt to clear the tank 
for filename in os.listdir(fish_directory):
    os.remove(fish_directory + "/" + filename)

if os.path.isfile(known_files_file):
    os.remove(known_files_file)


def check_for_new_local_files(local_directory,fish_directory, known_files_file):
    # Check if the known_files_file exists
    if os.path.isfile(known_files_file):
        # Read the list of known files from the file
        with open(known_files_file, 'r') as f:
            known_files = [line.strip() for line in f.readlines()]
    else:
        # If the file doesn't exist, initialize an empty list
        known_files = []

    # List all files in the local directory
    local_files = [f for f in os.listdir(local_directory) if os.path.isfile(os.path.join(local_directory, f))]

    # Find new files by comparing the lists
    new_files = list(set(local_files) - set(known_files))

    # Update the known_files_file with the latest list of files
    with open(known_files_file, 'w') as f:
        for file in local_files:
            f.write(file + '\n')

    return new_files

def move_files(new_files, local_directory, fish_directory):
    # Ensure the fish_directory exists
    os.makedirs(fish_directory, exist_ok=True)

    for file_name in new_files:
        # Define the paths to the original and new files
        original_path = os.path.join(local_directory, file_name)
        new_path = os.path.join(fish_directory, file_name)

        # Move the file to the fish_directory
        os.rename(original_path, new_path)

def check_for_new_cloud_files(connection_string, container_name, known_files_file):
    # Initialize the BlobServiceClient with your connection string
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)

    # Get a reference to the container
    container_client = blob_service_client.get_container_client(container_name)

    # List all blobs in the container
    blobs = [blob.name for blob in container_client.list_blobs()]

    # Check if the known_files_file exists
    if os.path.isfile(known_files_file):
        # Read the list of known files from the file
        with open(known_files_file, 'r') as f:
            known_files = [line.strip() for line in f.readlines()]
    else:
        # If the file doesn't exist, initialize an empty list
        known_files = []

    # Find new files by comparing the lists
    new_files = list(set(blobs) - set(known_files))

    # Update the known_files_file with the latest list of blobs
    with open(known_files_file, 'w') as f:
        for blob in blobs:
            f.write(blob + '\n')

    return new_files

def download_files_from_blob(connection_string, container_name, new_files, download_directory):
    # Initialize the BlobServiceClient with your connection string
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)

    # Get a reference to the container
    container_client = blob_service_client.get_container_client(container_name)

    # Ensure the download directory exists
    os.makedirs(download_directory, exist_ok=True)

    for file_name in new_files:
        # Construct the BlobClient for the file
        blob_client = container_client.get_blob_client(file_name)

        # Define the path to save the file locally
        local_path = os.path.join(download_directory, file_name)

        # Download the file from Azure Blob Storage to the local directory
        with open(local_path, "wb") as local_file:
            data = blob_client.download_blob()
            local_file.write(data.readall())


def remove_white_background(image_path, tolerance=20):
    # Load the image
    image = pygame.image.load(image_path)

    # Convert the image to a Surface with per-pixel alpha
    image = image.convert_alpha()

    # Create a NumPy array from the image for efficient pixel manipulation
    pixel_array = surfarray.array3d(image)

    # Define the range of white values
    white_range = [(255, 255, 255)]  # Add more colors to this list as needed


    # Set the color key for the specified white range
    for white_color in white_range:
        lower_bound = np.array([white_color[0] - tolerance, white_color[1] - tolerance, white_color[2] - tolerance])
        upper_bound = np.array([white_color[0] + tolerance, white_color[1] + tolerance, white_color[2] + tolerance])

        # Create a boolean mask for pixels within the specified range
        mask = ((pixel_array >= lower_bound) & (pixel_array <= upper_bound)).all(axis=-1)

        #add another mask to hte bottom right corner to remove the DALL-E logo
        mask[900:1024,950:1024] = True

        # Set the color key for the range
        image.set_colorkey((255, 255, 255))
        # Set the alpha value to 0 for the pixels within the specified range
        surfarray.pixels_alpha(image)[mask] = 0


    #soften the image
    image = pygame.transform.smoothscale(image, (int(image.get_width()*0.5), int(image.get_height()*0.5)))

    return image

def new_fish():
    if load_method == 'local':
        new_files = check_for_new_local_files(local_directory, fish_directory, known_files_file)
        move_files(new_files, local_directory, fish_directory)

    elif load_method == 'azure':
        new_files = check_for_new_cloud_files(connection_string, container_name, known_files_file)
        download_files_from_blob(connection_string, container_name, new_files, fish_directory)
    else:
        print('no loading method specified')

    # append new files to the list of fish images
    for filename in new_files:
        if filename.endswith(".png") :
            add_fish(fish_directory + "/" + filename,100)
            print('new fish swimming in')


# Initialize Pygame
pygame.init()

#check azure for new files
if load_method == 'local':
    new_files = check_for_new_local_files(local_directory, fish_directory, known_files_file)
    move_files(new_files, local_directory, fish_directory)
elif load_method == 'azure':
    new_files = check_for_new_cloud_files(connection_string, container_name, known_files_file)
    #downlaod new files
    download_files_from_blob(connection_string, container_name, new_files, fish_directory)
else:
    print('no loading method specified')

# Screen dimensions

#measure
infoObject = pygame.display.Info()
ratio =(infoObject.current_w, infoObject.current_h)

width = 1800
height = int(width/ratio[0]*ratio[1])

RES = (width, height)

# Create the screen
screen = pygame.display.set_mode(RES, pygame.SCALED | pygame.RESIZABLE)

#screen = pygame.display.set_mode((width, height), pygame.FULLSCREEN)
pygame.display.set_caption("Dall-E Aquarium")

# Load the background image
background_image = pygame.transform.scale(pygame.image.load("background.jpg"), (int(width * 1), int(height * 1)))
# Load in wave overlay
wave_overlay = pygame.transform.scale(pygame.image.load("wave_overlay.png").convert(), (int(width * 1.5), int(height * 1.5)))
#make this transparent to taste
wave_overlay.set_alpha(45)

# Load the fish image and scale it down to 10%
fish_images = []
directions=[]
speed=[]
coords=[]
sin_wave=[]
rotation=[]

bubbles=[]
bubble_speed=[]
bubbles_coords=[]

def add_bubble():
    scale = random.uniform(0.11,0.5)
    bubbles.append(pygame.transform.scale(pygame.image.load("bubble.png"), (int(100*scale), int(100*scale))))
    bubble_speed.append(scale)
    bubbles_coords.append([random.uniform(width/7,(width/7)+200), random.uniform(height,height+500)])

def add_fish(image_path,fish_separation_factor=1500):

    scale = random.uniform(0.5,1.5)
    h_correct = 0

    if 'whale' in image_path.lower():
        scale = 2
        h_correct = 700
    elif 'shark' in image_path.lower():
        scale = 1
        h_correct = 200

    image_of_fish = remove_white_background(image_path).convert_alpha()
    fish_images.append(pygame.transform.scale(image_of_fish, (int(image_of_fish.get_width() * scale), int(image_of_fish.get_height() * scale))))

    if 'right_' in image_path:
        directions.append(0)
        print('right fish alert',image_path)
        coords.append([random.uniform(-300,-1*fish_separation_factor), random.uniform(0,height-300-h_correct)])
    else:
        directions.append(1)
        coords.append([random.uniform(width,width+fish_separation_factor), random.uniform(0,height-300-h_correct)])

    speed.append(random.uniform(0.05, 0.2))
    sin_wave.append([random.uniform(0.1,1),random.uniform(0.01,0.2)]) #[ampliture,period]
    rotation.append(random.uniform(0,10))
    
def remove_fish(i):
    fish_images.pop(i)
    directions.pop(i)
    speed.pop(i)
    coords.pop(i)
    sin_wave.pop(i)
    rotation.pop(i)


#loop over png files in the fish directory

for filename in os.listdir(fish_directory):
    if filename.endswith(".png"):
        add_fish(fish_directory + "/" + filename)

for bubble in range(25):
    add_bubble()

starfish = []
for image in os.listdir(star_fish_directory):
    starfish.append(pygame.transform.scale(pygame.image.load(star_fish_directory + "/" + image), (int(100), int(100))))

# Create a clock object to control the frame rate
clock = pygame.time.Clock()


count= 0
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Draw the background image
    screen.blit(background_image, (0, 0))
    fish_separation_factor=100*len(fish_images)

    for i,fishy in enumerate (fish_images):

        if directions[i]==0:

            #randomise x,y values (0 is x, 1 is y)
            coords[i][0] += speed[i]
            if coords[i][0] > (width+(fish_separation_factor)):
                coords[i][0] = (width+random.uniform(300,(fish_separation_factor)))*-1
                if len(fish_images) > fish_limit:
                    #remove fish
                    remove_fish(i)
                    i-=1

                    continue

        else:

            #randomise x,y values (0 is x, 1 is y)
            coords[i][0] += -1*speed[i]
            if coords[i][0] < -300:
                coords[i][0] = width+random.uniform(300,(fish_separation_factor))
                if len(fish_images) > fish_limit:
                    #remove fish
                    remove_fish(i)
                    i-=1

                    continue


        coords[i][1] += sin_wave[i][0]*(math.sin(sin_wave[i][1]*(coords[i][0])))#random.uniform(-0.2, 0.2)

        rot = 15*math.sin(rotation[i]*count*0.001)
        fishy = pygame.transform.rotate(fishy, rot)

        #print(coords[i][0], coords[i][1])
        screen.blit(fishy, (coords[i][0], coords[i][1]))

    for j, bubble in enumerate(bubbles):
        

        bubbles_coords[j][1] -= bubble_speed[j]
        screen.blit(bubble, (bubbles_coords[j][0], bubbles_coords[j][1]))

        if bubbles_coords[j][1] < -100:
            bubbles_coords[j][1] = height+random.uniform(100,500)

    #add the wave overlay and move it left and right as the count increases
    screen.blit(wave_overlay, (-500,-200+math.sin(count*0.005)*50))
        
    #animate the starfish
    screen.blit(starfish[int(count*0.03%len(starfish))], (width-200,height-200))
        

    
    #Check for new files every 10 ticks
    if count % 1000 == 0:
        threading.Thread(target=new_fish).start()

    # Update the display
    pygame.display.update()

    # Control the frame rate
    clock.tick(120)
    count += 1

    for event in pygame.event.get():

        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                print("SPACE")
                #remove last fish
                if len(fish_images) > 0:
                    remove_fish(len(fish_images)-1)



            if event.key == pygame.K_ESCAPE:
                pygame.quit()
                sys.exit()

            if event.key == pygame.K_f:
                #delete all files
                for filename in os.listdir(fish_directory):
                    os.remove(fish_directory + "/" + filename)
                #delete known_files.txt
                if os.path.isfile(known_files_file):
                    os.remove(known_files_file)
  
                #delete all files in the azure blob
                if load_method == 'azure':
                    # Initialize the BlobServiceClient with your connection string
                    blob_service_client = BlobServiceClient.from_connection_string(connection_string)

                    # Get a reference to the container
                    container_client = blob_service_client.get_container_client(container_name)

                    # List all blobs in the container
                    blobs = [blob.name for blob in container_client.list_blobs()]
                    for blob in blobs:
                        container_client.delete_blob(blob)
                    
                for i in range(len(fish_images)):
                    remove_fish(i)

# Quit Pygame
pygame.quit()
sys.exit()
