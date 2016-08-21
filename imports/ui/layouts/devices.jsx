const MediaQuery = require('react-responsive');

export class MediumDevice extends MediaQuery {}
MediumDevice.defaultProps = { minWidth: 992 };

export class MediumAndSmallDevice extends MediaQuery {}
MediumAndSmallDevice.defaultProps = { minWidth: 480 };

export class SmallDevice extends MediaQuery {}
SmallDevice.defaultProps = { minWidth: 480, maxWidth: 991 };

export class SmallAndTinyDevice extends MediaQuery {}
SmallAndTinyDevice.defaultProps = { maxWidth: 991 };

export class TinyDevice extends MediaQuery {}
TinyDevice.defaultProps = { maxWidth: 479 };
