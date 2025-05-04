import React from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  ButtonGroup, 
  Button,
  Chip,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  ViewDay as DayViewIcon,
  ViewWeek as WeekViewIcon,
  CalendarMonth as MonthViewIcon
} from '@mui/icons-material';
import { addDays, format } from 'date-fns';

// Create a theme that matches the app's color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#344055',
      light: '#5b6880',
      dark: '#0d1a2e',
    },
    secondary: {
      main: '#dca54c',
      light: '#ffd77d',
      dark: '#a97719',
    },
  },
});

interface MaterialToolbarProps {
  date: Date;
  view: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: string) => void;
  label?: string;
}

const MaterialToolbar: React.FC<MaterialToolbarProps> = ({ 
  date, 
  view, 
  onNavigate, 
  onView, 
  label 
}) => {
  // Handle navigation
  const goToPrev = () => onNavigate('PREV');
  const goToNext = () => onNavigate('NEXT');
  const goToToday = () => onNavigate('TODAY');
  
  // Handle view change
  const goToDay = () => onView('day');
  const goToWeek = () => onView('week');
  const goToMonth = () => onView('month');

  // Format the label based on the current view
  const getFormattedLabel = () => {
    switch (view) {
      case 'day':
        return format(date, 'MMMM d, yyyy');
      case 'week':
        const startOfWeek = date;
        const endOfWeek = addDays(date, 6);
        return `${format(startOfWeek, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
      case 'month':
        return format(date, 'MMMM yyyy');
      default:
        return label || format(date, 'MMMM yyyy');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          mb: 2,
          gap: 2,
          p: 1
        }}
      >
        {/* Left section - Title and Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 600, 
              color: 'primary.main',
              mr: 2
            }}
          >
            {getFormattedLabel()}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={goToPrev}
              color="primary"
              size="small"
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <Button 
              onClick={goToToday}
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<TodayIcon fontSize="small" />}
              sx={{ mx: 1 }}
            >
              Today
            </Button>
            
            <IconButton 
              onClick={goToNext}
              color="primary"
              size="small"
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Right section - View Selection */}
        <ButtonGroup 
          variant="outlined" 
          size="small" 
          sx={{ 
            boxShadow: 1,
            borderRadius: 1, 
            overflow: 'hidden'
          }}
        >
          <Button 
            onClick={goToDay}
            variant={view === 'day' ? 'contained' : 'outlined'}
            color={view === 'day' ? 'secondary' : 'primary'}
            sx={{ 
              fontWeight: view === 'day' ? 600 : 400,
            }}
            startIcon={<DayViewIcon fontSize="small" />}
          >
            Day
          </Button>
          
          <Button 
            onClick={goToWeek}
            variant={view === 'week' ? 'contained' : 'outlined'}
            color={view === 'week' ? 'secondary' : 'primary'}
            sx={{ 
              fontWeight: view === 'week' ? 600 : 400,
            }}
            startIcon={<WeekViewIcon fontSize="small" />}
          >
            Week
          </Button>
          
          <Button 
            onClick={goToMonth}
            variant={view === 'month' ? 'contained' : 'outlined'}
            color={view === 'month' ? 'secondary' : 'primary'}
            sx={{ 
              fontWeight: view === 'month' ? 600 : 400,
            }}
            startIcon={<MonthViewIcon fontSize="small" />}
          >
            Month
          </Button>
        </ButtonGroup>
        
        {/* Mobile View Indicator */}
        <Chip 
          label={`${view.charAt(0).toUpperCase() + view.slice(1)} View`}
          color="secondary"
          size="small"
          sx={{ 
            display: { xs: 'flex', sm: 'none' },
            alignSelf: 'flex-end'
          }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default MaterialToolbar;