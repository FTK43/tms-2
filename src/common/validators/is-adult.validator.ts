import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAdult(minAge = 18, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAdult',
      target: object.constructor,
      propertyName,
      constraints: [minAge],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [minAge] = args.constraints;
          if (typeof value !== 'number') {
            return false;
          }

          return value >= minAge;
        },
        defaultMessage(args: ValidationArguments) {
          const [minAge] = args.constraints;
          return `Возраст $value в поле $property должен быть не менее ${minAge}`;
        },
      },
    });
  };
}
