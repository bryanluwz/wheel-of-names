import { Component, Fragment, createRef } from "react";
import { ContentDisplay } from "../components/others";
import { Wheel } from "react-custom-roulette";
import { getCookieValue, setCookieValue } from "../components/utils/cookieMonster";

export default class WheelOfNames extends Component {
	constructor(props) {
		super(props);

		this.state = {
			wheelData: [], // this is the formated array of options that is goin got be passed into the wheel
			data: [], // this is an array of the options
			selectedIndex: -1,
			history: [],
			isSpinning: false,
			isSidebarHidden: false,
			canClearLast: false
		};

		this.backgroundColors = {
			"--yellow-pastel-1": "#ffefc4",
			"--blue-pastel-1": "#def8ff",
			"--pink-pastel-1": "#ffeeed",
			"--teal-pastel-1": "#e4fbf7",
		};
		this.textColors = { "--lavender-pastel-font-1": "#5d4542" };

		this.optionsInputTextareaRef = createRef();

		this.cookieName = "wheelOfNames";

		this.maxOptionLength = 13;
	}

	componentDidMount() {
		this.handleOptionsUpdate();
		const wheelOfNamesData = getCookieValue(this.cookieName);
		if (wheelOfNamesData) {
			if (wheelOfNamesData.data) {
				this.setState({ data: wheelOfNamesData.data });
				this.optionsInputTextareaRef.current.value = wheelOfNamesData.data.join("\n");
			}
			if (wheelOfNamesData.history) {
				this.setState({ history: wheelOfNamesData.history });
			}
			if (wheelOfNamesData.isSidebarHidden) {
				this.setState({ isSidebarHidden: wheelOfNamesData.isSidebarHidden });
			}
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.data !== this.state.data) {
			this.handleOptionsUpdate();
			this.setStoredOptions(this.state.data);
		}

		if (prevState.history !== this.state.history) {
			this.setStoredHistory(this.state.history);
		}

		if (prevState.isSidebarHidden !== this.state.isSidebarHidden) {
			this.setStoredIsSidebarHidden(this.state.isSidebarHidden);
		}
	}

	// Spin button / functionality handler functions
	handleSpinButton = () => {
		if (!this.state.isSpinning && this.state.data.length !== 0) {
			const { wheelData } = this.state;
			wheelData.forEach(obj => {
				obj.style = {};
			});
			this.setState({
				selectedIndex: Math.floor((Math.random() * this.state.wheelData.length * 69420) % this.state.wheelData.length),
				isSpinning: true
			});
		}
	};

	handleFinishSpin = () => {
		if (this.state.isSpinning) {
			this.setState({ isSpinning: false, canClearLast: true });

			const { wheelData } = this.state;
			var winningOption = wheelData[this.state.selectedIndex];
			winningOption.style.textColor = "#FF00FF";
			this.setState({ wheelData: wheelData });
		}
	};

	// History
	getStoredHistory = () => {
		const data = getCookieValue(this.cookieName);
		if (data) {
			if (data.history)
				return data.history;
		}
	};

	setStoredHistory = (nextHistory) => {
		const data = getCookieValue(this.cookieName);
		if (data) {
			data.history = nextHistory;
			setCookieValue(this.cookieName, data);
		}
		else {
			setCookieValue(this.cookieName, { history: nextHistory });
		}
	};

	// Hidden sidebar
	getStoredIsSidebarHidden = () => {
		const data = getCookieValue(this.cookieName);
		if (data) {
			if (data.history)
				return data.history;
		}
	};

	setStoredIsSidebarHidden = (nextValue) => {
		const data = getCookieValue(this.cookieName);
		if (data) {
			data.isSidebarHidden = nextValue;
			setCookieValue(this.cookieName, data);
		}
		else {
			setCookieValue(this.cookieName, { isSidebarHidden: nextValue });
		}
	};

	updateHistorySection = (nextHistoryEntry) => {
		const history = this.state.history;
		history.push(nextHistoryEntry);
		this.setState({ history: [...history] });
	};

	handleClearHistoryButton = () => {
		if (this.state.isSpinning) return;
		this.setState({ history: [] });
	};

	// Handle wheel customisation / update
	handleOptionsUpdate = () => {
		const wheelData = [];
		const data = this.state.data.map(option => option.length > this.maxOptionLength ? option.substring(0, this.maxOptionLength) + '...' : option);

		var bgIndex = 0;

		for (var i = 0; i < data.length; i++) {
			const option = data[i];
			var existIndex = wheelData.findIndex(obj => obj.option === option);
			if (existIndex !== -1) {
				wheelData[existIndex].optionSize++;
			}
			else {
				wheelData.push(
					{
						option: option,
						image: "",
						style: {
							backgroundColor: this.backgroundColors[Object.keys(this.backgroundColors)[(bgIndex + ((i === data.length - 1 && bgIndex % Object.keys(this.backgroundColors).length === 0) ? 1 : 0)) % Object.keys(this.backgroundColors).length]]
						},
						optionSize: 1
					});
				bgIndex++;
			}
		}

		if (wheelData.length === 0) {
			wheelData.push({ option: "", image: "", style: {}, optionSize: 1 });
		}

		this.setState({ wheelData: wheelData });
	};

	// Handle textarea display & functionality
	handleOptionsInputTextareaChange = (event) => {
		if (this.state.isSpinning) return;
		const nextData = event?.target.value.split("\n")
			.map(option => option.trim())
			.filter(option => option !== '');

		if (nextData !== undefined)
			this.setState({ data: nextData });
		else
			this.setState({ data: [] });
	};

	// Handle other buttons
	handleClearTextareaButton = () => {
		if (this.state.isSpinning) return;
		this.optionsInputTextareaRef.current.value = "";
		this.handleOptionsInputTextareaChange();
	};

	handleClearLastWinButton = () => {
		if (!this.state.canClearLast || this.state.isSpinning) return;

		const history = this.state.history;
		const lastWin = history.at(-1);

		if (this.state.data.indexOf(lastWin) === -1) return;

		const newTextareaValue = this.optionsInputTextareaRef.current.value.split("\n")
			.map(option => option.trim())
			.filter(option => (option !== '' && option !== lastWin))
			.join("\n");
		this.optionsInputTextareaRef.current.value = newTextareaValue;
		this.setState({ canClearLast: false });
		this.handleOptionsInputTextareaChange();
	};

	handleHideButton = () => {
		if (this.state.isSpinning) return;
		this.setState((prevState) => ({ isSidebarHidden: !prevState.isSidebarHidden }));
	};

	// Handle stored data
	getStoredOptions = () => {
		const data = getCookieValue(this.cookieName);
		if (data) {
			if (data.data)
				return data.data;
		}
	};

	// The trash icon
	handleDeleteHistoryButton = () => {
		this.setState({
			wheelData: [], // this is the formated array of options that is goin got be passed into the wheel
			data: [], // this is an array of the options
			history: [],
			isSpinning: false,
			isSidebarHidden: false,
			canClearLast: false
		});
		this.optionsInputTextareaRef.current.value = "";
	};

	setStoredOptions = (nextData) => {
		const data = getCookieValue(this.cookieName);
		if (data) {
			data.data = nextData;
			setCookieValue(this.cookieName, data);
		}
		else {
			setCookieValue(this.cookieName, { data: nextData });
		}
	};

	render() {
		return (
			<ContentDisplay
				backButtonRedirect={"https://bryanluwz.github.io/#/fun-stuff"}
				displayName={WheelOfNames.displayName}
				displayClearHistory={true}
				faIcon="fa-trash"
				contentBodyAdditionalClasses={[]}
				router={this.props.router}
				handleHeaderTitleClick={() => { ; }}
				handleDeleteHistoryButton={this.handleDeleteHistoryButton}
				style={{ overflowX: "visible" }}
			>
				<div className="won-wrapper">
					{/* These containers will appear side by side, unless second container hidden, then main will be middle*/}
					<div className="won-main-container">
						<div className="won-wheel-container"
						>
							{/* This is where the wheel will be in */}
							<Wheel
								mustStartSpinning={this.state.isSpinning}
								prizeNumber={this.state.selectedIndex}
								data={this.state.wheelData}
								onStopSpinning={() => {
									this.handleFinishSpin();
									this.updateHistorySection(this.state.data[this.state.selectedIndex]);
								}}
								disableInitialAnimation
								spinDuration={0.420}

								pointerProps={{ src: process.env.PUBLIC_URL + "/images/shuba.png", style: { userSelect: "none" } }}

								radiusLineWidth={0}
								outerBorderColor="none"

								fontFamily="Poppins"
								fontSize={20 - 0.2 * this.state.data.length}
								textDistance={Math.max(45 + 0.2 * this.state.data.length, 68)}
								perpendicularText={this.state.data.length < 6}

								backgroundColors={Object.values(this.backgroundColors)}
								textColors={Object.values(this.textColors)}
							/>
						</div>
						<button
							className={`won-spin-button ${(this.state.isSpinning || this.state.data.length === 0) ? 'won-spin-button-spinning' : ''}`}
							onClick={this.handleSpinButton}>
							SPIN
						</button>
					</div>

					{/* In mobile no hiding just scrolling */}
					<div className={`won-info-container ${this.state.isSidebarHidden ? "won-info-container-hidden" : ""}`}>
						<div className="won-info-header">
							<button
								className={`won-function-button ${!this.state.canClearLast || this.state.isSpinning ? "won-spin-button-spinning" : ""}`}
								style={{ display: `${this.state.isSidebarHidden ? "none" : "block"}` }}
								onClick={this.handleClearLastWinButton}
							>
								Clear last
							</button>
							<button
								className={`won-function-button ${this.state.isSpinning ? "won-spin-button-spinning" : ""}`}
								style={{ display: `${this.state.isSidebarHidden ? "none" : "block"}` }}
								onClick={this.handleClearTextareaButton}
							>
								Clear
							</button>
							<button
								className={`won-function-button ${this.state.isSpinning ? "won-spin-button-spinning" : ""}`}
								onClick={this.handleHideButton}
								style={{ display: "block" }}
							>
								{this.state.isSidebarHidden ? "Unhide" : "Hide"}
							</button>
						</div>
						{/* only body hidable */}
						<div className="won-info-body">
							<div className="won-info">
								{/* Other functions (sort, shuffle) might be added here in the future */}
								<textarea
									ref={this.optionsInputTextareaRef}
									className="won-options-container"
									placeholder="Enter your options here"
									onChange={this.handleOptionsInputTextareaChange}
								/>
							</div>
							<div className="won-history">
								<div className="won-history-header">
									<div className="won-history-title">
										Wheel history
									</div>
									<button
										className={`won-function-button ${this.state.isSpinning ? "won-spin-button-spinning" : ""}`}
										onClick={this.handleClearHistoryButton}
									>
										Clear history
									</button>
								</div>
								<div className="won-history-record">
									{this.state.history.length > 0 ?
										this.state.history.map((record, index) => (
											<Fragment key={index}>
												<span>{record}</span>
												<br />
											</Fragment>
										))
										:
										<span>no records D:</span>
									}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ContentDisplay >
		);
	}
}

WheelOfNames.displayName = "Wheel of Names";
