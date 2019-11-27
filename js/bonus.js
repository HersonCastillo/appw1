function calculateBonus() {
  const btn = Get('#bonuscalc');
  btn.attr('disabled', true);
  setTimeout(() => {
    let errors = [];
    const salary = +Get('#salaryid').val();
    const years = +Get('#yearsid').val();
    const days = +Get('#daysid').val();

    if (isValidNumber(salary, 1, Infinity)) {
      if (isValidNumber(years, 0, 35)) {
        if (isValidNumber(days, 1, 364)) {
          let bonus = 0;
          if (years < 1) {
            bonus = (days * getSalaryForDays(salary, 15)) / 365;
          }
          if (years >= 1 && years < 3) {
            bonus = getSalaryForDays(salary, 15);
          }
          if (years >= 3 && years < 10) {
            bonus = getSalaryForDays(salary, 19);
          } bonuscalc
          if (years >= 10) {
            bonus = getSalaryForDays(salary, 21);
          }
          Get('#bonus').html(bonus.toFixed(2));
        } else {
          errors.push('Days is not valid');
        }
      } else {
        errors.push('Years is not valid');
      }
    } else {
      errors.push('Salary is not valid');
    }
    updateErrors(errors);
    btn.attr('disabled', false);
  }, 500);
}

function updateErrors(errors) {
  const list = [];
  const el = Get('#errors');
  errors.forEach(el => list.push(`<li>${el}</li>`));
  if (list.length > 0) {
    const template = `
      <div class="alert alert-danger">
        <ul>
          ${list.join('')}
        </ul>
      </div>
    `;
    el.html(template);
  } else {
    el.html('');
  }
}

function getSalaryForDays(s, d) {
  return (s * d) / 30;
}

function isValidNumber(varbl, min, max) {
  if (varbl != null && typeof varbl === 'number') {
    return varbl >= min && varbl <= max;
  }
  return false;
}