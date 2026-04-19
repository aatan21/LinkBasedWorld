class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.addChoice("Begin the story");
        this.engine.inventory = [] // Initialize an empty inventory array when the game starts
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // TODO: replace this text by the initial location of the story
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key]; // TODO: use `key` to get the data object for the current story location
        this.engine.show(locationData.Body); // TODO: replace this text by the Body of the location data
        
        // Check if this location has an Item. If it does, add it to the inventory and show a message about finding the item.
        if (locationData.Item) {
            if (!this.engine.inventory.includes(locationData.Item)) {
                this.engine.inventory.push(locationData.Item);
                this.engine.show("<strong>You found a " + locationData.Item + "!</strong>");
            }
        }

        if(locationData.Choices) { // TODO: check if the location has any Choices
            for(let choice of locationData.Choices) { // TODO: loop over the location's Choices
                // If the choice requires an item, only add the choice if it's in the inventory
                if (choice.RequiredItem) {
                    if (this.engine.inventory.includes(choice.RequiredItem)) {
                        this.engine.addChoice(choice.Text, choice); 
                    }
                } else {
                    // If no item is required, add the choice normally
                    this.engine.addChoice(choice.Text, choice); // TODO: use the Text of the choice
                }
                // TODO: add a useful second argument to addChoice so that the current code of handleChoice below works
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            // Route the player to the custom ArcadeLocation if they go to the Vending Corner
            if (choice.Target === "Vending Corner") {
                this.engine.gotoScene(ArcadeLocation, choice.Target);
            } else {
                this.engine.gotoScene(Location, choice.Target);
            }
        } else {
            this.engine.gotoScene(End);
        }
    }
}

// Custom Subclass for the Location-Specific Mechanism
class ArcadeLocation extends Location {
    create(key) {
        // First, run standard Location code (show body text, regular exits, etc.)
        super.create(key);
        
        // Then, add the custom interactive mechanism choice
        this.engine.addChoice("Press the sticky 'Player 1' button", { isArcadeButton: true });
    }

    handleChoice(choice) {
        // Intercept the custom button press
        if (choice && choice.isArcadeButton) {
            this.engine.show("&gt; Press the sticky 'Player 1' button");
            
            // Fetch the array of screens from our JSON
            let screens = this.engine.storyData.Locations["Vending Corner"].ArcadeScreens;
    
            // Pick a random screen
            let randomScreen = screens[Math.floor(Math.random() * screens.length)];
            
            // Show the result
            this.engine.show("<em>The arcade screen flickers and aggressively flashes: <strong>" + randomScreen + "</strong></em><br>");

            // Reload the current scene so the player can push it again or leave via normal exits
            this.engine.gotoScene(ArcadeLocation, "Vending Corner");
        } else {
            // If they clicked a normal exit (like "Aisle 1"), let the parent Location class handle it
            super.handleChoice(choice);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');