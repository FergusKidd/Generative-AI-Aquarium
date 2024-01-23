# Aquarium

This section is to deploy the aquarium itself locally. This runs as a pygame indefinitely until the app is quit. If using an external monitor, be sure to connect this first, as the code will optimise for the screen size on startup only.

## Installation

Create a new python 3.11 environemt

open a command line and navigate to your install directory

pip or pip3 install the requirements.txt into the environement using

`pip install -r requirements.txt`

if azure storage is not able to install, install it using:

`pip install azure-storage-blob`

## Configuration

duplicate the .env.template file. Fill in the values with you azure blob storage connection string, and container name (you will also need this for the webapp)

Also configure a local file path if you would prefer to laod fish in from an existing directory.

Fianlly, enter 'azure' or 'local' for method. the azure method will pull files from your blob container, the lcoal method will pull files from your chosen local path.

## Usage

To start the aquarium run:

`python fish_tank.py`

## Controls

Once running there are a few keybaord controls to be aware of.

Pressing the 'spacebar' key will remove the last fish added. This is useful if the fish is innapropriate, or the background is malformed.

Pressing the 'f' key will delete all of the fish, both locally, AND in the Azure storage, and should only be used if you want to start completely fresh.

Pressing esc will quit the aquarium application without affecting the fish.

You can reload at anytime and your fish will still be there, unless you press the 'f' key.