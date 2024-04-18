class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); // using this.engine.storyData to find the story title
        this.engine.addChoice("Start");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // the initial location of the story
    }
}

let inventory = [];
let barrier = true;

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key]; // use `key` to get the data object for the current story location
        this.engine.show(locationData.Body); // the Body of the location data
        
        if(locationData.Choices) { // check if the location has any Choices
            for(let choice of locationData.Choices) { // loop over the location's Choices
                if(!(choice.Rune && inventory.includes(choice.Rune))) { // checks if player collected a rune from a choice's location
                    this.engine.addChoice(choice.Text, choice); // use the Text of the choice
                }
            }
        } else {
            this.engine.addChoice("End.");
        }

        if(locationData.LockedChoices) {
            for(let choice of locationData.LockedChoices) {
                let unlock = true;

                for(let req of choice.Needs) {
                    if(!inventory.includes(req)) {
                        unlock = false;
                        break;
                    }
                }

                if(unlock) {
                    this.engine.addChoice(choice.Text, choice);
                }
            }
        }
    }

    handleChoice(choice) {
        if(choice) {
            if(choice.Gives) {
                inventory.push(choice.Gives);
                console.log("Inventory: "+inventory);
            }
            if(choice.BarrierOut) {
                barrier = false;
            }

            this.engine.show("&gt; "+choice.Text);
            if(choice.Barrier) { // determines if the location is a regular location or has something to do with the barrier
                this.engine.gotoScene(BarrierLocation, choice.Target);
            } else {
                this.engine.gotoScene(Location, choice.Target);
            }
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class BarrierLocation extends Location {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        if(barrier) {
            this.engine.show(locationData.Body);
        } else {
            this.engine.show(locationData.AltBody);
        }
        
        if(locationData.Choices) {
            for(let choice of locationData.Choices) {
                this.engine.addChoice(choice.Text, choice);
            }
        } else {
            this.engine.addChoice("Error.");
        }

        if(locationData.LockedChoices) { // choices displayed if the barrier is down
            for(let choice of locationData.LockedChoices) {
                if(!barrier) {
                    this.engine.addChoice(choice.Text, choice);
                }
            }
        }
        if(locationData.BarrierChoices && barrier) { // choices displayed if the barrier is up
            for(let choice of locationData.BarrierChoices) {
                this.engine.addChoice(choice.Text, choice);
            }
        }
    }
}

class End extends Scene {
    create() {
        inventory = [];
        barrier = true;
        
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
        this.engine.show("<hr>");
        this.engine.addChoice("Wake up");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // restarts the story
    }
}

Engine.load(Start, 'myStory.json');