module.exports = body => {
  if (body.object_kind === 'push') {
    const l = body.commits.length
    const prefix = l === 1 ? 'commit' : 'commits'
    let commitMessages = ''
    body.commits.forEach(item => {
      commitMessages += `
        - [${item.id.substring(0, 7)}](${item.url}): ${item.message} -- ${item.author.name}
      `
    })

    return `
      [${body.project.path_with_namespace}]: ${body.commits.length} ${prefix} pushed to ${body.ref.split('/')[2]}
      ${commitMessages}
    `
  } else if (body.object_kind === 'issue') {
    const attr = body.object_attributes
    return `
      [${body.project.path_with_namespace}]: [Issue #${attr.id}](attr.url) ${attr.title} ${attr.state} by ${body.user.username}
    `
  } else if (body.object_kind === 'note') {
    const issue = body.issue
    const attr = body.object_attributes
    return `
      [${body.project.path_with_namespace}]: [Issue #${issue.id}](attr.url) ${issue.title} created comment by ${body.user.username}
      ${attr.note}
    `
  } else {
    return ''
  }
}
