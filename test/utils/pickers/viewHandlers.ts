import { fireTouchChangedEvent, userEvent, screen } from '@mui/monorepo/test/utils';
import { getClockTouchEvent } from 'test/utils/pickers-utils';
import { MuiPickersAdapter, TimeView } from '@mui/x-date-pickers/models';

type TDate = any;

interface ViewHandler<TView> {
  setViewValue: (utils: MuiPickersAdapter<any>, viewValue: TDate, view?: TView) => void;
}

export const timeClockHandler: ViewHandler<TimeView> = {
  setViewValue: (adapter, value, view) => {
    const hasMeridiem = adapter.is12HourCycleInCurrentLocale();

    let valueInt;
    let clockView;

    if (view === 'hours') {
      valueInt = adapter.getHours(value);
      clockView = hasMeridiem ? '12hours' : '24hours';
    } else if (view === 'minutes') {
      valueInt = adapter.getMinutes(value);
      clockView = 'minutes';
    } else {
      throw new Error('View not supported');
    }

    const hourClockEvent = getClockTouchEvent(valueInt, clockView);

    fireTouchChangedEvent(screen.getByMuiTest('clock'), 'touchmove', hourClockEvent);
    fireTouchChangedEvent(screen.getByMuiTest('clock'), 'touchend', hourClockEvent);
  },
};

export const digitalClockHandler: ViewHandler<TimeView> = {
  setViewValue: (adapter, value) => {
    const hasMeridiem = adapter.is12HourCycleInCurrentLocale();
    const formattedLabel = adapter.format(value, hasMeridiem ? 'fullTime12h' : 'fullTime24h');
    userEvent.mousePress(screen.getByRole('option', { name: formattedLabel }));
  },
};

export const multiSectionDigitalClockHandler: ViewHandler<TimeView> = {
  setViewValue: (adapter, value) => {
    const hasMeridiem = adapter.is12HourCycleInCurrentLocale();
    const hoursLabel = parseInt(adapter.format(value, hasMeridiem ? 'hours12h' : 'hours24h'), 10);
    const minutesLabel = adapter.getMinutes(value).toString();
    userEvent.mousePress(screen.getByRole('option', { name: `${hoursLabel} hours` }));
    userEvent.mousePress(screen.getByRole('option', { name: `${minutesLabel} minutes` }));
    if (hasMeridiem) {
      userEvent.mousePress(
        screen.getByRole('option', {
          name: adapter.getMeridiemText(adapter.getHours(value) >= 12 ? 'pm' : 'am'),
        }),
      );
    }
  },
};
