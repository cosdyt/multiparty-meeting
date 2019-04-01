import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import classnames from 'classnames';
import * as appPropTypes from '../appPropTypes';
import { withRoomContext } from '../../RoomContext';
import Fab from '@material-ui/core/Fab';
// import Avatar from '@material-ui/core/Avatar';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideoIcon from '@material-ui/icons/Videocam';
import VideoOffIcon from '@material-ui/icons/VideocamOff';
import ScreenIcon from '@material-ui/icons/ScreenShare';
import ScreenOffIcon from '@material-ui/icons/StopScreenShare';
import ExtensionIcon from '@material-ui/icons/Extension';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
// import HandOff from '../../images/icon-hand-black.svg';
// import HandOn from '../../images/icon-hand-white.svg';
import LeaveIcon from '@material-ui/icons/Cancel';

const styles = (theme) =>
	({
		root :
		{
			position                     : 'fixed',
			zIndex                       : 500,
			display                      : 'flex',
			[theme.breakpoints.up('md')] :
			{
				top            : '50%',
				transform      : 'translate(0%, -50%)',
				flexDirection  : 'column',
				justifyContent : 'center',
				alignItems     : 'center',
				left           : '1.0em',
				width          : '2.6em'
			},
			[theme.breakpoints.down('sm')] :
			{
				flexDirection : 'row',
				bottom        : '0.5em',
				left          : '50%',
				transform     : 'translate(-50%, -0%)'
			}
		},
		fab :
		{
			margin : theme.spacing.unit
		},
		show :
		{
			opacity    : 1,
			transition : 'opacity .5s'
		},
		hide :
		{
			opacity    : 0,
			transition : 'opacity .5s'
		}
	});

const Sidebar = (props) =>
{
	const {
		roomClient,
		toolbarsVisible,
		me,
		micProducer,
		webcamProducer,
		screenProducer,
		locked,
		classes,
		theme
	} = props;

	let micState;

	if (!me.canSendMic)
		micState = 'unsupported';
	else if (!micProducer)
		micState = 'unsupported';
	else if (!micProducer.locallyPaused && !micProducer.remotelyPaused)
		micState = 'on';
	else
		micState = 'off';

	let webcamState;

	if (!me.canSendWebcam)
		webcamState = 'unsupported';
	else if (webcamProducer)
		webcamState = 'on';
	else
		webcamState = 'off';

	let screenState;

	if (me.needExtension)
	{
		screenState = 'need-extension';
	}
	else if (!me.canShareScreen)
	{
		screenState = 'unsupported';
	}
	else if (screenProducer)
	{
		screenState = 'on';
	}
	else
	{
		screenState = 'off';
	}

	const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<div
			className={
				classnames(classes.root, toolbarsVisible ? classes.show : classes.hide)
			}
		>
			<Fab
				aria-label='Mute mic'
				className={classes.fab}
				color={micState === 'on' ? 'default' : 'secondary'}
				size={smallScreen ? 'large' : 'medium'}
				onClick={() =>
				{
					micState === 'on' ?
						roomClient.muteMic() :
						roomClient.unmuteMic();
				}}
			>
				{ micState === 'on' ?
					<MicIcon />
					:
					<MicOffIcon />
				}
			</Fab>
			<Fab
				aria-label='Mute video'
				className={classes.fab}
				color={webcamState === 'on' ? 'default' : 'secondary'}
				size={smallScreen ? 'large' : 'medium'}
				onClick={() =>
				{
					webcamState === 'on' ?
						roomClient.disableWebcam() :
						roomClient.enableWebcam();
				}}
			>
				{ webcamState === 'on' ?
					<VideoIcon />
					:
					<VideoOffIcon />
				}
			</Fab>
			<Fab
				aria-label='Share screen'
				className={classes.fab}
				disabled={!me.canShareScreen || me.screenShareInProgress}
				color={screenState === 'on' ? 'primary' : 'default'}
				size={smallScreen ? 'large' : 'medium'}
				onClick={() =>
				{
					switch (screenState)
					{
						case 'on':
						{
							roomClient.disableScreenSharing();
							break;
						}
						case 'off':
						{
							roomClient.enableScreenSharing();
							break;
						}
						case 'need-extension':
						{
							roomClient.installExtension();
							break;
						}
						default:
						{
							break;
						}
					}
				}}
			>
				{ screenState === 'on' || screenState === 'unsupported' ?
					<ScreenOffIcon/>
					:null
				}
				{ screenState === 'off' ?
					<ScreenIcon/>
					:null
				}
				{ screenState === 'need-extension' ?
					<ExtensionIcon/>
					:null
				}
			</Fab>

			<Fab
				aria-label='Room lock'
				className={classes.fab}
				color={locked ? 'primary' : 'default'}
				size={smallScreen ? 'large' : 'medium'}
				onClick={() =>
				{
					if (locked)
					{
						roomClient.unlockRoom();
					}
					else
					{
						roomClient.lockRoom();
					}
				}}
			>
				{ locked ?
					<LockIcon />
					:
					<LockOpenIcon />
				}
			</Fab>

			{ /* <Fab
				aria-label='Raise hand'
				className={classes.fab}
				disabled={me.raiseHandInProgress}
				color={me.raiseHand ? 'primary' : 'default'}
				size='large'
				onClick={() => roomClient.sendRaiseHandState(!me.raiseHand)}
			>
				<Avatar alt='Hand' src={me.raiseHand ? HandOn : HandOff} />
			</Fab>  */ }

			<Fab
				aria-label='Leave meeting'
				className={classes.fab}
				color='secondary'
				size={smallScreen ? 'large' : 'medium'}
				onClick={() => roomClient.close()}
			>
				<LeaveIcon />
			</Fab>
		</div>
	);
};

Sidebar.propTypes =
{
	roomClient      : PropTypes.any.isRequired,
	toolbarsVisible : PropTypes.bool.isRequired,
	me              : appPropTypes.Me.isRequired,
	micProducer     : appPropTypes.Producer,
	webcamProducer  : appPropTypes.Producer,
	screenProducer  : appPropTypes.Producer,
	locked          : PropTypes.bool.isRequired,
	classes         : PropTypes.object.isRequired,
	theme           : PropTypes.object.isRequired
};

const mapStateToProps = (state) =>
	({
		toolbarsVisible : state.room.toolbarsVisible,
		micProducer     : Object.values(state.producers)
			.find((producer) => producer.source === 'mic'),
		webcamProducer : Object.values(state.producers)
			.find((producer) => producer.source === 'webcam'),
		screenProducer : Object.values(state.producers)
			.find((producer) => producer.source === 'screen'),
		me     : state.me,
		locked : state.room.locked
	});

export default withRoomContext(connect(
	mapStateToProps
)(withStyles(styles, { withTheme: true })(Sidebar)));
