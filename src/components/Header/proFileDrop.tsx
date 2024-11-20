'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TranslateIcon from '@mui/icons-material/Translate';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import HelpIcon from '@mui/icons-material/Help';
import InviteIcon from '../../assets/Invite_icon.svg';
import LogoutIcon from '@mui/icons-material/Logout';
// {t('submit')}
import { useTranslations } from 'next-intl';

import './proFileDrop.css'
import { deleteAllCache } from '@/utils/storageService';
import { useRouter } from 'next/navigation';
import { environment } from "@/environments/env.api";

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [profileName, setProfileName] = React.useState<string>('OP' as string);
  const router = useRouter();
  const t = useTranslations("ORDERS")

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    console.log('logout');
    const fromRms = Boolean(localStorage.getItem('isRmsLogin'))
    deleteAllCache();
    if(fromRms) {
      router.push('/signin')
    } else {
      const isDev = process.env.NODE_ENV === 'development';
      router.push(isDev ? environment.DEV_ETMS : environment.PROD_SMART);
    }
  }

  const createProfileName = (name: string) => {
    let nameArray = name.split(' ');
    let profileName = '';
    nameArray.forEach((name, index) => {
      if (index < 2) {
        profileName += name[0].toUpperCase();
      }
    });
    return profileName;
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('user_name') as string;
      if (name) {
        const profileInitials = createProfileName(name);
        setProfileName(profileInitials);
      }
    }
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    handleClose();
  };

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{p:0}}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 40, height: 40,}}>
            {profileName}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            width:184,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* <MenuItem onClick={handleClose} className="menuItem"  sx={{fontSize:14, fontWeight:500}}>
            <div className="iconContainer">
                <PersonIcon className="translateIcon" sx={{height:14, width:14}}/>
            </div>
            Profile
        </MenuItem> */}
        <MenuItem onClick={() => handleNavigation('/handlingAgent')} className="menuItem"  sx={{fontSize:14, fontWeight:500}}>
            <div className="iconContainer">
              <img src={InviteIcon.src} className="translateIcon" style={{height: 14, width: 14}} />
            </div>
             {t('handlingAgent')}
        </MenuItem>

        {/* <MenuItem onClick={handleClose} className="menuItem" sx={{fontSize:14, fontWeight:500}}>
            <div className="iconContainer">
                <TranslateIcon className="translateIcon" sx={{height:14, width:14}} />
            </div>
            Language
        </MenuItem> */}

        {/* <MenuItem onClick={handleClose} className="menuItem" sx={{fontSize:14, fontWeight:500}}>
            <div className="iconContainer">
                <SettingsIcon className="translateIcon" sx={{height:14, width:14}} />
            </div>
            Settings
        </MenuItem> */}

        {/* <MenuItem onClick={handleClose} className="menuItem" sx={{fontSize:14, fontWeight:500}}>
            <div className="iconContainer">
                <EmailIcon className="translateIcon" sx={{height:14, width:14}} />
            </div>
            Email/Sms
        </MenuItem> */}

        {/* <MenuItem onClick={handleClose} className="menuItem" sx={{fontSize:14, fontWeight:500}}>
            <div className="iconContainer">
                <HelpIcon className="translateIcon" sx={{height:14, width:14}} />
            </div>
            Help
        </MenuItem> */}

        <MenuItem onClick={() => handleLogout()} className="menuItem" sx={{fontSize:14, fontWeight:500}}>
            <div className="iconContainer">
                <LogoutIcon className="translateIcon" sx={{height:14, width:14}} />
            </div>
            {t('logout')}
        </MenuItem>
        
      </Menu>
    </React.Fragment>
  );
}
